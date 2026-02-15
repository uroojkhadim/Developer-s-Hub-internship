// Re-export all selectors for easy importing
export {
  selectAuth,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../slices/authSlice';

export {
  selectPosts,
  selectAllPosts,
  selectPostsLoading,
  selectPostsRefreshing,
  selectPostsError,
  selectHasMore,
  selectLastVisible,
} from '../slices/postsSlice';

// Combined selectors
export const selectUserData = (state: any) => ({
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated,
  loading: state.auth.loading,
});

export const selectFeedData = (state: any) => ({
  posts: state.posts.posts,
  loading: state.posts.loading,
  refreshing: state.posts.refreshing,
  hasMore: state.posts.hasMore,
  error: state.posts.error,
});

// Utility selectors
export const selectUserPosts = (state: any, userId: string) =>
  state.posts.posts.filter((post: any) => post.userId === userId);

export const selectPostById = (state: any, postId: string) =>
  state.posts.posts.find((post: any) => post.id === postId);
