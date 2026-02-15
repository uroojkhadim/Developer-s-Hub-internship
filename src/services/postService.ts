import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  where,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../config/firebase';
import { createLikeNotification, createCommentNotification } from '../hooks/useNotifications';
import followService from './followService';

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  content: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  timestamp: Timestamp;
  likedBy: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  content: string;
  timestamp: Timestamp;
}

export interface CreatePostData {
  content: string;
  imageUrl?: string;
}

export interface PostQueryParams {
  limit?: number;
  lastVisible?: any;
}

class PostService {
  private db = getFirestore();
  private storage = getStorage();
  private postsCollection = collection(this.db, 'posts');
  private commentsCollection = collection(this.db, 'comments');

  async createPost(data: CreatePostData): Promise<Post> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Get user profile for username and avatar
      const userProfile = await this.getUserProfile(auth.currentUser.uid);

      const postData = {
        userId: auth.currentUser.uid,
        username: userProfile?.name || auth.currentUser.displayName || 'Anonymous',
        userAvatar: userProfile?.profileImage || auth.currentUser.photoURL || null,
        content: data.content.trim(),
        imageUrl: data.imageUrl || null,
        likes: 0,
        comments: 0,
        timestamp: Timestamp.now(),
        likedBy: [],
      };

      const docRef = await addDoc(this.postsCollection, postData);

      // Get the created post
      const postDoc = await getDoc(docRef);
      return { id: postDoc.id, ...postDoc.data() } as Post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  async getPosts(params: PostQueryParams = {}): Promise<{ posts: Post[]; lastVisible: any }> {
    try {
      const { limit: limitCount = 10, lastVisible } = params;

      let q = query(this.postsCollection, orderBy('timestamp', 'desc'), limit(limitCount));

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];
      let lastDoc = null;

      querySnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
        lastDoc = doc;
      });

      return { posts, lastVisible: lastDoc };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  async getUserPosts(userId: string, limitCount: number = 10): Promise<Post[]> {
    try {
      const q = query(
        this.postsCollection,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
      });

      return posts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw new Error('Failed to fetch user posts');
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const postRef = doc(this.db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const postData = postDoc.data();
      const userId = auth.currentUser.uid;
      const likedBy = postData.likedBy || [];
      const isLiked = likedBy.includes(userId);

      // Get current user profile for notification
      const currentUserProfile = await this.getUserProfile(userId);
      const currentUser = auth.currentUser;

      if (isLiked) {
        // Unlike
        const updatedLikedBy = likedBy.filter((id: string) => id !== userId);
        await updateDoc(postRef, {
          likes: postData.likes - 1,
          likedBy: updatedLikedBy,
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likes: postData.likes + 1,
          likedBy: [...likedBy, userId],
        });

        // Create notification for post owner (if it's not their own post)
        if (postData.userId !== userId) {
          await createLikeNotification(
            postData.userId,
            userId,
            currentUserProfile?.name || currentUser.displayName || 'Someone',
            currentUserProfile?.profileImage || currentUser.photoURL || null,
            postId
          );
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
      throw new Error('Failed to like post');
    }
  }

  async updatePost(postId: string, data: Partial<Post>): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const postRef = doc(this.db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const postData = postDoc.data();
      if (postData.userId !== auth.currentUser.uid) {
        throw new Error('Not authorized to edit this post');
      }

      // Only update fields that are provided
      const updateData: any = {};
      if (data.content !== undefined) updateData.content = data.content.trim();
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      updateData.updatedAt = Timestamp.now();

      await updateDoc(postRef, updateData);
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const postRef = doc(this.db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const postData = postDoc.data();
      if (postData.userId !== auth.currentUser.uid) {
        throw new Error('Not authorized to delete this post');
      }

      await deleteDoc(postRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  // Real-time listeners
  subscribeToPosts(
    callback: (posts: Post[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const q = query(this.postsCollection, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, 
      (snapshot) => {
        const posts: Post[] = [];
        snapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() } as Post);
        });
        callback(posts);
      },
      (error) => {
        console.error('Error in posts listener:', error);
        errorCallback?.(error);
      }
    );
  }

  subscribeToPost(
    postId: string,
    callback: (post: Post | null) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const postRef = doc(this.db, 'posts', postId);
    
    return onSnapshot(postRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in post listener:', error);
        errorCallback?.(error);
      }
    );
  }

  subscribeToPostLikes(
    postId: string,
    callback: (likes: number, likedBy: string[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const postRef = doc(this.db, 'posts', postId);
    
    return onSnapshot(postRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback(data.likes || 0, data.likedBy || []);
        }
      },
      (error) => {
        console.error('Error in likes listener:', error);
        errorCallback?.(error);
      }
    );
  }

  async uploadPostImage(imageUri: string): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Convert file URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create storage reference with unique filename
      const storageRef = ref(this.storage, `posts/${auth.currentUser.uid}_${Date.now()}`);

      // Upload image
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading post image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Comments functionality
  async addComment(postId: string, content: string): Promise<Comment> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Get user profile for username and avatar
      const userProfile = await this.getUserProfile(auth.currentUser.uid);
      const currentUser = auth.currentUser;
      
      const commentData = {
        postId,
        userId: auth.currentUser.uid,
        username: userProfile?.name || currentUser.displayName || 'Anonymous',
        userAvatar: userProfile?.profileImage || currentUser.photoURL || null,
        content: content.trim(),
        timestamp: Timestamp.now(),
      };

      const docRef = await addDoc(this.commentsCollection, commentData);
      
      // Get the created comment
      const commentDoc = await getDoc(docRef);
      
      // Update post comment count
      const postRef = doc(this.db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        await updateDoc(postRef, {
          comments: (postData.comments || 0) + 1
        });

        // Create notification for post owner (if it's not their own post)
        if (postData.userId !== auth.currentUser.uid) {
          await createCommentNotification(
            postData.userId,
            auth.currentUser.uid,
            userProfile?.name || currentUser.displayName || 'Someone',
            userProfile?.profileImage || currentUser.photoURL || null,
            postId,
            content
          );
        }
      }
      
      return { id: commentDoc.id, ...commentDoc.data() } as Comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(this.db, 'comments'),
        where('postId', '==', postId),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const comments: Comment[] = [];
      
      querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  }

  async deleteComment(commentId: string, postId: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const commentRef = doc(this.db, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }
      
      const commentData = commentDoc.data();
      if (commentData.userId !== auth.currentUser.uid) {
        throw new Error('Not authorized to delete this comment');
      }
      
      await deleteDoc(commentRef);
      
      // Update post comment count
      const postRef = doc(this.db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        await updateDoc(postRef, {
          comments: Math.max(0, (postData.comments || 0) - 1)
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    }
  }

  // Real-time comment listeners
  subscribeToComments(
    postId: string,
    callback: (comments: Comment[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const q = query(
      collection(this.db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q,
      (snapshot) => {
        const comments: Comment[] = [];
        snapshot.forEach((doc) => {
          comments.push({ id: doc.id, ...doc.data() } as Comment);
        });
        callback(comments);
      },
      (error) => {
        console.error('Error in comments listener:', error);
        errorCallback?.(error);
      }
    );
  }

  subscribeToPostCommentsCount(
    postId: string,
    callback: (count: number) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const postRef = doc(this.db, 'posts', postId);
    
    return onSnapshot(postRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback(data.comments || 0);
        }
      },
      (error) => {
        console.error('Error in comments count listener:', error);
        errorCallback?.(error);
      }
    );
  }

  private async getUserProfile(uid: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get posts from followed users only
   */
  async getPostsFromFollowedUsers(params: PostQueryParams = {}): Promise<{ posts: Post[]; lastVisible: any }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUserId = auth.currentUser.uid;

      // Get the list of users that the current user is following
      const followingResult = await followService.getFollowing(currentUserId, params.limit || 20, params.lastVisible);
      const followedUserIds = followingResult.following.map(user => user.id);

      if (followedUserIds.length === 0) {
        // Return empty array if no one is being followed
        return { posts: [], lastVisible: null };
      }

      // Now get posts from these followed users
      // Note: For better performance in production, consider implementing a timeline collection where posts are aggregated
      let q = query(
        collection(this.db, 'posts'),
        where('userId', 'in', followedUserIds),
        orderBy('timestamp', 'desc')
      );

      if (params.limit) {
        q = query(q, limit(params.limit));
      }

      if (params.lastVisible) {
        q = query(q, startAfter(params.lastVisible));
      }

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      return {
        posts,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error('Error getting posts from followed users:', error);
      throw error;
    }
  }
}

export default new PostService();
