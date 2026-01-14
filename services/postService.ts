import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db as firestoreDb, storage } from '../config/firebase';

const getDb = () => {
  if (!firestoreDb) {
    throw new Error('Firestore is not initialized. Please configure Firebase properly.');
  }
  return firestoreDb;
};

const getStorage = () => {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Please configure Firebase properly.');
  }
  return storage;
};

import { Comment, Post } from '../types/post';

// Create a new post
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>) => {
  try {
    const postRef = await addDoc(collection(getDb(), 'posts'), {
      ...postData,
      likes: [],
      comments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { id: postRef.id, ...postData, likes: [], comments: [], createdAt: new Date(), updatedAt: new Date() };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Upload post media (image or video)
export const uploadPostMedia = async (uri: string, userId: string, type: 'image' | 'video' = 'image') => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const extension = type === 'video' ? 'mp4' : 'jpg';
    const filename = `posts/${userId}/${Date.now()}.${extension}`;
    const storageRef = ref(getStorage(), filename);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading post image:', error);
    throw error;
  }
};

// Get all posts (one-time fetch)
export const getPosts = async (): Promise<Post[]> => {
  try {
    const q = query(collection(getDb(), 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to Date objects
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      // Ensure comments have proper timestamps
      comments: (doc.data().comments || []).map((comment: any) => ({
        ...comment,
        createdAt: comment.createdAt?.toDate() || new Date(),
      })),
    })) as Post[];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Subscribe to posts in real time
export const subscribeToPosts = (
  onPosts: (posts: Post[]) => void,
  onError: (error: Error) => void
) => {
  try {
    const q = query(collection(getDb(), 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      snapshot => {
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          comments: (doc.data().comments || []).map((comment: any) => ({
            ...comment,
            createdAt: comment.createdAt?.toDate() || new Date(),
          })),
        })) as Post[];
        onPosts(posts);
      },
      error => onError(error as Error)
    );
  } catch (error: any) {
    onError(error);
    return () => {};
  }
};

// Like a post
export const likePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(getDb(), 'posts', postId);
    // In a real app, you would use arrayUnion to add the user ID to the likes array
    // This is a simplified version
    const post = await getPostById(postId);
    const updatedLikes = post.likes.includes(userId)
      ? post.likes.filter(id => id !== userId) // Unlike
      : [...post.likes, userId]; // Like
    
    await updateDoc(postRef, {
      likes: updatedLikes,
      updatedAt: serverTimestamp(),
    });
    
    return updatedLikes;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Update a post (owner only)
export const updatePost = async (
  postId: string,
  updates: Partial<Pick<Post, 'content' | 'imageUrl'>>
) => {
  try {
    const postRef = doc(getDb(), 'posts', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post (owner only)
export const deletePost = async (postId: string) => {
  try {
    const postRef = doc(getDb(), 'posts', postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
  try {
    const postRef = doc(getDb(), 'posts', postId);
    const newComment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    await updateDoc(postRef, {
      comments: [...(await getPostById(postId)).comments, newComment],
      updatedAt: serverTimestamp(),
    });
    
    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Helper function to get a post by ID
const getPostById = async (postId: string): Promise<Post> => {
  const docRef = doc(getDb(), 'posts', postId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    throw new Error('Post not found');
  }
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate() || new Date(),
    updatedAt: snapshot.data().updatedAt?.toDate() || new Date(),
    comments: (snapshot.data().comments || []).map((comment: any) => ({
      ...comment,
      createdAt: comment.createdAt?.toDate() || new Date(),
    })),
  } as Post;
};
