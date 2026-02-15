import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import postService from '../../services/postService';
import type { Post as PostType } from '../../services/postService';

// Define TypeScript interfaces
interface PostsState {
  posts: PostType[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  hasMore: boolean;
  lastVisible: any;
}

// Define payload types
interface CreatePostPayload {
  content: string;
  imageUrl?: string;
}

interface PaginatedPosts {
  posts: PostType[];
  lastVisible: any;
}

// Async thunks for posts operations
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params: { limit?: number; lastVisible?: any }, { rejectWithValue }) => {
    try {
      const result = await postService.getPosts(params);
      return result as PaginatedPosts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: CreatePostPayload, { rejectWithValue }) => {
    try {
      const post = await postService.createPost(postData);
      return post;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create post');
    }
  }
);

export const likePostAsync = createAsyncThunk(
  'posts/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await postService.likePost(postId);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to like post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await postService.deletePost(postId);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete post');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const posts = await postService.getUserPosts(userId);
      return posts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user posts');
    }
  }
);

export const fetchFollowedPosts = createAsyncThunk(
  'posts/fetchFollowedPosts',
  async (params: { limit?: number; lastVisible?: any }, { rejectWithValue }) => {
    try {
      const result = await postService.getPostsFromFollowedUsers(params);
      return result as PaginatedPosts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch posts from followed users');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, content, imageUrl }: { postId: string; content: string; imageUrl?: string }, { rejectWithValue }) => {
    try {
      await postService.updatePost(postId, { content, imageUrl });
      return { postId, content, imageUrl };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update post');
    }
  }
);

// Initial state
const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  refreshing: false,
  hasMore: true,
  lastVisible: null,
};

// Create posts slice
export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Synchronous reducers
    clearPosts: state => {
      state.posts = [];
      state.lastVisible = null;
      state.hasMore = true;
    },
    clearError: state => {
      state.error = null;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    // Optimistic updates
    toggleLikeOptimistic: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        const isLiked = post.likedBy?.includes(post.userId) || false;
        post.likes = isLiked ? post.likes - 1 : post.likes + 1;
        if (isLiked) {
          post.likedBy = post.likedBy?.filter(id => id !== post.userId) || [];
        } else {
          post.likedBy = [...(post.likedBy || []), post.userId];
        }
      }
    },
  },
  // Handle async thunk states
  extraReducers: builder => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state, action) => {
        // Only set loading if it's not a refresh
        if (!action.meta.arg.lastVisible) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.lastVisible = action.payload.lastVisible;
        state.hasMore = action.payload.posts.length > 0;

        // If it's a refresh, replace posts, otherwise append
        if (!action.meta.arg.lastVisible) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Like post
      .addCase(likePostAsync.fulfilled, (state, action) => {
        // The optimistic update already happened
        // This just confirms the operation
      })
      .addCase(likePostAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // TODO: Rollback optimistic update on failure
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch user posts
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch followed posts
      .addCase(fetchFollowedPosts.pending, (state, action) => {
        // Only set loading if it's not a refresh
        if (!action.meta.arg.lastVisible) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
        state.error = null;
      })
      .addCase(fetchFollowedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.lastVisible = action.payload.lastVisible;
        state.hasMore = action.payload.posts.length > 0;

        // If it's a refresh, replace posts, otherwise append
        if (!action.meta.arg.lastVisible) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
      })
      .addCase(fetchFollowedPosts.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const { postId, content, imageUrl } = action.payload;
        const postIndex = state.posts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            content: content || state.posts[postIndex].content,
            imageUrl: imageUrl !== undefined ? imageUrl : state.posts[postIndex].imageUrl,
          };
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearPosts, clearError, setHasMore, toggleLikeOptimistic } = postsSlice.actions;

// Export selectors
export const selectPosts = (state: RootState) => state.posts;
export const selectAllPosts = (state: RootState) => state.posts.posts;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
export const selectPostsRefreshing = (state: RootState) => state.posts.refreshing;
export const selectPostsError = (state: RootState) => state.posts.error;
export const selectHasMore = (state: RootState) => state.posts.hasMore;
export const selectLastVisible = (state: RootState) => state.posts.lastVisible;

// Export reducer
export default postsSlice.reducer;

// Export RootState type for selectors
export type RootState = {
  posts: PostsState;
};
