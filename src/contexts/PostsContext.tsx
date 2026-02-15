import React, { createContext, useContext, useReducer, useCallback } from 'react';
import postService from '../services/postService';
import type { Post as PostType } from '../services/postService';

// Define TypeScript interfaces
interface PostsState {
  posts: PostType[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  hasMore: boolean;
  lastVisible: any;
}

interface CreatePostPayload {
  content: string;
  imageUrl?: string;
}

interface PaginatedPosts {
  posts: PostType[];
  lastVisible: any;
}

// Action types
type PostsAction =
  | { type: 'FETCH_POSTS_START' }
  | { type: 'FETCH_POSTS_SUCCESS'; payload: PaginatedPosts; isRefresh: boolean }
  | { type: 'FETCH_POSTS_FAILURE'; payload: string }
  | { type: 'CREATE_POST_START' }
  | { type: 'CREATE_POST_SUCCESS'; payload: PostType }
  | { type: 'CREATE_POST_FAILURE'; payload: string }
  | { type: 'LIKE_POST_START' }
  | { type: 'LIKE_POST_SUCCESS'; payload: string }
  | { type: 'LIKE_POST_FAILURE'; payload: string }
  | { type: 'DELETE_POST_START' }
  | { type: 'DELETE_POST_SUCCESS'; payload: string }
  | { type: 'DELETE_POST_FAILURE'; payload: string }
  | { type: 'FETCH_USER_POSTS_START' }
  | { type: 'FETCH_USER_POSTS_SUCCESS'; payload: PostType[] }
  | { type: 'FETCH_USER_POSTS_FAILURE'; payload: string }
  | { type: 'CLEAR_POSTS' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'TOGGLE_LIKE_OPTIMISTIC'; payload: { postId: string; userId: string } };

// Initial state
const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  refreshing: false,
  hasMore: true,
  lastVisible: null,
};

// Reducer function
function postsReducer(state: PostsState, action: PostsAction): PostsState {
  switch (action.type) {
    case 'FETCH_POSTS_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_POSTS_SUCCESS':
      return {
        ...state,
        loading: false,
        refreshing: false,
        lastVisible: action.payload.lastVisible,
        hasMore: action.payload.posts.length > 0,
        posts: action.isRefresh 
          ? action.payload.posts 
          : [...state.posts, ...action.payload.posts],
        error: null,
      };
    case 'FETCH_POSTS_FAILURE':
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: action.payload,
      };
    case 'CREATE_POST_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'CREATE_POST_SUCCESS':
      return {
        ...state,
        loading: false,
        posts: [action.payload, ...state.posts],
        error: null,
      };
    case 'CREATE_POST_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'LIKE_POST_START':
      return {
        ...state,
        // Don't set loading for optimistic updates
        error: null,
      };
    case 'LIKE_POST_SUCCESS':
      // Optimistic update already happened
      return state;
    case 'LIKE_POST_FAILURE':
      return {
        ...state,
        error: action.payload,
        // TODO: Rollback optimistic update
      };
    case 'DELETE_POST_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'DELETE_POST_SUCCESS':
      return {
        ...state,
        loading: false,
        posts: state.posts.filter(post => post.id !== action.payload),
        error: null,
      };
    case 'DELETE_POST_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'FETCH_USER_POSTS_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_USER_POSTS_SUCCESS':
      return {
        ...state,
        loading: false,
        posts: action.payload,
        error: null,
      };
    case 'FETCH_USER_POSTS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_POSTS':
      return {
        ...state,
        posts: [],
        lastVisible: null,
        hasMore: true,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_HAS_MORE':
      return {
        ...state,
        hasMore: action.payload,
      };
    case 'TOGGLE_LIKE_OPTIMISTIC':
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.payload.postId) {
            const isLiked = post.likedBy?.includes(action.payload.userId) || false;
            return {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1,
              likedBy: isLiked
                ? post.likedBy?.filter(id => id !== action.payload.userId) || []
                : [...(post.likedBy || []), action.payload.userId],
            };
          }
          return post;
        }),
      };
    default:
      return state;
  }
}

// Create context
interface PostsContextType {
  state: PostsState;
  fetchPosts: (params?: { limit?: number; lastVisible?: any }) => Promise<void>;
  createPost: (postData: CreatePostPayload) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<void>;
  clearPosts: () => void;
  clearError: () => void;
  setHasMore: (hasMore: boolean) => void;
  toggleLikeOptimistic: (postId: string, userId: string) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Custom hook to use posts context
export const usePosts = (): PostsContextType => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

// Provider component
interface PostsProviderProps {
  children: React.ReactNode;
}

export const PostsProvider: React.FC<PostsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(postsReducer, initialState);

  // Fetch posts function
  const fetchPosts = useCallback(async (params: { limit?: number; lastVisible?: any } = {}) => {
    const isRefresh = !params.lastVisible;
    
    if (isRefresh) {
      dispatch({ type: 'FETCH_POSTS_START' });
    } else {
      // For pagination, we don't want to show loading spinner
      // Just set a flag or handle differently if needed
    }
    
    try {
      const result = await postService.getPosts(params);
      dispatch({ 
        type: 'FETCH_POSTS_SUCCESS', 
        payload: result, 
        isRefresh 
      });
    } catch (error: any) {
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: error.message || 'Failed to fetch posts' });
      throw error;
    }
  }, []);

  // Create post function
  const createPost = useCallback(async (postData: CreatePostPayload) => {
    dispatch({ type: 'CREATE_POST_START' });
    try {
      const post = await postService.createPost(postData);
      dispatch({ type: 'CREATE_POST_SUCCESS', payload: post });
    } catch (error: any) {
      dispatch({ type: 'CREATE_POST_FAILURE', payload: error.message || 'Failed to create post' });
      throw error;
    }
  }, []);

  // Like post function
  const likePost = useCallback(async (postId: string, userId: string) => {
    dispatch({ type: 'LIKE_POST_START' });
    try {
      // Optimistic update
      dispatch({ type: 'TOGGLE_LIKE_OPTIMISTIC', payload: { postId, userId } });
      
      await postService.likePost(postId);
      dispatch({ type: 'LIKE_POST_SUCCESS', payload: postId });
    } catch (error: any) {
      dispatch({ type: 'LIKE_POST_FAILURE', payload: error.message || 'Failed to like post' });
      throw error;
    }
  }, []);

  // Delete post function
  const deletePost = useCallback(async (postId: string) => {
    dispatch({ type: 'DELETE_POST_START' });
    try {
      await postService.deletePost(postId);
      dispatch({ type: 'DELETE_POST_SUCCESS', payload: postId });
    } catch (error: any) {
      dispatch({ type: 'DELETE_POST_FAILURE', payload: error.message || 'Failed to delete post' });
      throw error;
    }
  }, []);

  // Fetch user posts function
  const fetchUserPosts = useCallback(async (userId: string) => {
    dispatch({ type: 'FETCH_USER_POSTS_START' });
    try {
      const posts = await postService.getUserPosts(userId);
      dispatch({ type: 'FETCH_USER_POSTS_SUCCESS', payload: posts });
    } catch (error: any) {
      dispatch({ type: 'FETCH_USER_POSTS_FAILURE', payload: error.message || 'Failed to fetch user posts' });
      throw error;
    }
  }, []);

  // Clear posts function
  const clearPosts = useCallback(() => {
    dispatch({ type: 'CLEAR_POSTS' });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Set has more function
  const setHasMore = useCallback((hasMore: boolean) => {
    dispatch({ type: 'SET_HAS_MORE', payload: hasMore });
  }, []);

  // Toggle like optimistic function
  const toggleLikeOptimistic = useCallback((postId: string, userId: string) => {
    dispatch({ type: 'TOGGLE_LIKE_OPTIMISTIC', payload: { postId, userId } });
  }, []);

  const value: PostsContextType = {
    state,
    fetchPosts,
    createPost,
    likePost,
    deletePost,
    fetchUserPosts,
    clearPosts,
    clearError,
    setHasMore,
    toggleLikeOptimistic,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export default PostsContext;