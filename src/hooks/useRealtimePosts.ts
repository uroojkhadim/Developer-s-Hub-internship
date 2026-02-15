import { useState, useEffect, useCallback, useRef } from 'react';
import { Post, Comment } from '../services/postService';
import postService from '../services/postService';
import { auth } from '../config/firebase';

interface UseRealtimePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  unsubscribe: () => void;
}

/**
 * Custom hook for real-time posts feed
 * Subscribes to Firestore posts collection and provides real-time updates
 */
export const useRealtimePosts = (limit: number = 10): UseRealtimePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    // Subscribe to real-time posts updates
    const unsubscribe = postService.subscribeToPosts(
      (newPosts) => {
        // Limit the posts to specified count
        const limitedPosts = newPosts.slice(0, limit);
        setPosts(limitedPosts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [limit]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  return {
    posts,
    loading,
    error,
    refresh,
    unsubscribe,
  };
};

interface UseRealtimePostReturn {
  post: Post | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  unsubscribe: () => void;
}

/**
 * Custom hook for real-time single post
 * Subscribes to a specific post and provides real-time updates
 */
export const useRealtimePost = (postId: string): UseRealtimePostReturn => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      setPost(null);
      return;
    }

    // Subscribe to real-time post updates
    const unsubscribe = postService.subscribeToPost(
      postId,
      (updatedPost) => {
        setPost(updatedPost);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [postId]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  return {
    post,
    loading,
    error,
    refresh,
    unsubscribe,
  };
};

interface UseRealtimeLikesReturn {
  likes: number;
  likedBy: string[];
  isLiked: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  unsubscribe: () => void;
}

/**
 * Custom hook for real-time likes
 * Subscribes to post likes and provides real-time updates
 */
export const useRealtimeLikes = (postId: string): UseRealtimeLikesReturn => {
  const [likes, setLikes] = useState<number>(0);
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const currentUserId = auth.currentUser?.uid || '';
  const isLiked = likedBy.includes(currentUserId);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      setLikes(0);
      setLikedBy([]);
      return;
    }

    // Subscribe to real-time likes updates
    const unsubscribe = postService.subscribeToPostLikes(
      postId,
      (newLikes, newLikedBy) => {
        setLikes(newLikes);
        setLikedBy(newLikedBy);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [postId]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  return {
    likes,
    likedBy,
    isLiked,
    loading,
    error,
    refresh,
    unsubscribe,
  };
};

interface UseRealtimeCommentsReturn {
  comments: Comment[];
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  unsubscribe: () => void;
  unsubscribeCount: () => void;
}

/**
 * Custom hook for real-time comments
 * Subscribes to post comments and provides real-time updates
 */
export const useRealtimeComments = (postId: string): UseRealtimeCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const unsubscribeCountRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      setComments([]);
      setCount(0);
      return;
    }

    // Subscribe to real-time comments
    const unsubscribe = postService.subscribeToComments(
      postId,
      (newComments) => {
        setComments(newComments);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // Subscribe to real-time comment count
    const unsubscribeCount = postService.subscribeToPostCommentsCount(
      postId,
      (newCount) => {
        setCount(newCount);
      },
      (err) => {
        console.error('Error in comments count subscription:', err);
      }
    );

    unsubscribeRef.current = unsubscribe;
    unsubscribeCountRef.current = unsubscribeCount;

    return () => {
      unsubscribe();
      unsubscribeCount();
    };
  }, [postId]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  const unsubscribeCount = useCallback(() => {
    if (unsubscribeCountRef.current) {
      unsubscribeCountRef.current();
      unsubscribeCountRef.current = null;
    }
  }, []);

  return {
    comments,
    count,
    loading,
    error,
    refresh,
    unsubscribe,
    unsubscribeCount,
  };
};

// Utility hook for cleanup
export const useListenerCleanup = () => {
  const listenersRef = useRef<Array<() => void>>([]);

  const addListener = useCallback((unsubscribe: () => void) => {
    listenersRef.current.push(unsubscribe);
  }, []);

  const cleanupListeners = useCallback(() => {
    listenersRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error cleaning up listener:', error);
      }
    });
    listenersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);

  return { addListener, cleanupListeners };
};