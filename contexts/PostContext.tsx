import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { addComment as addCommentService, createPost as createPostService, deletePost as deletePostService, getPosts, likePost as likePostService, subscribeToPosts, updatePost as updatePostService, uploadPostMedia } from '../services/postService';
import { scheduleLocalNotification } from '../services/notificationService';
import { Post } from '../types/post';
import { useAuth } from './AuthContext';

type PostContextType = {
  posts: Post[];
  loading: boolean;
  error: string | null;
  createPost: (content: string, imageUri?: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, content: string, userId: string, userName: string, userAvatar?: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
  updatePost: (postId: string, content: string, imageUri?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToPosts(
      fetchedPosts => {
        setPosts(fetchedPosts);
        setLoading(false);
        setError(null);
      },
      err => {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, imageUri?: string) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to post');
      }
      let uploadedUrl = '';
      if (imageUri) {
        const isVideo = imageUri.toLowerCase().endsWith('.mp4') || imageUri.toLowerCase().includes('video');
        uploadedUrl = await uploadPostMedia(imageUri, user.id, isVideo ? 'video' : 'image');
      }
      
      const postData = {
        userId: user.id,
        userName: user.name || 'User',
        userAvatar: user.avatar,
        content,
        imageUrl: uploadedUrl,
      };
      
      await createPostService(postData);
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  const likePost = async (postId: string, userId: string) => {
    try {
      await likePostService(postId, userId);
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const isLiked = post.likes.includes(userId);
            if (!isLiked && post.userId !== userId) {
              scheduleLocalNotification('New like', `${user?.name || 'Someone'} liked your post`, {
                postId,
                type: 'like',
              });
            }
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== userId)
                : [...post.likes, userId]
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Error liking post:', err);
      throw err;
    }
  };

  const addComment = async (postId: string, content: string, userId: string, userName: string, userAvatar?: string) => {
    try {
      const newComment = await addCommentService(postId, {
        userId,
        userName,
        userAvatar,
        content,
      });
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, newComment],
              }
            : post
        )
      );
      if (postId && user && newComment.userId !== user.id) {
        scheduleLocalNotification('New comment', `${user.name || 'Someone'} commented on your post`, {
          postId,
          type: 'comment',
        });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const updatePost = async (postId: string, content: string, imageUri?: string) => {
    try {
      let updatedImageUrl = imageUri;
      if (imageUri && user) {
        updatedImageUrl = await uploadPostMedia(imageUri, user.id, 'image');
      }
      await updatePostService(postId, { content, imageUrl: updatedImageUrl });
    } catch (err) {
      console.error('Error updating post:', err);
      throw err;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await deletePostService(postId);
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        createPost,
        likePost,
        addComment,
        refreshPosts: fetchPosts,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = (): PostContextType => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
