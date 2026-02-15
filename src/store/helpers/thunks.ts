// Re-export all thunks for easy importing
export { loginUser, registerUser, logoutUser, resetPassword } from '../slices/authSlice';

export {
  fetchPosts,
  createPost,
  likePostAsync,
  deletePost,
  fetchUserPosts,
} from '../slices/postsSlice';

// Combined operations
export const refreshFeed =
  (limit: number = 10) =>
  async (dispatch: any) => {
    dispatch(clearPosts());
    return dispatch(fetchPosts({ limit }));
  };

// Utility thunks
export const loadMorePosts = (limit: number = 10, lastVisible: any) =>
  fetchPosts({ limit, lastVisible });

export const likePostWithOptimistic = (postId: string) => async (dispatch: any, getState: any) => {
  // Get current post state for rollback
  const post = getState().posts.posts.find((p: any) => p.id === postId);
  const wasLiked = post?.likedBy?.includes(post.userId) || false;

  // Optimistic update
  dispatch(toggleLikeOptimistic(postId));

  try {
    // Actual API call
    await dispatch(likePostAsync(postId)).unwrap();
  } catch (error) {
    // Rollback on failure
    dispatch(toggleLikeOptimistic(postId));
    throw error;
  }
};

// Import required actions and thunks
import { clearPosts, toggleLikeOptimistic } from '../slices/postsSlice';
import { fetchPosts, likePostAsync } from '../slices/postsSlice';
