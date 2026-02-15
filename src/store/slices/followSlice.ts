import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import followService from '../../services/followService';

// Define TypeScript interfaces
interface FollowState {
  following: Record<string, boolean>; // userId -> isFollowing
  followers: string[]; // List of user IDs who follow the current user
  loading: boolean;
  error: string | null;
}

// Async thunks for follow operations
export const followUser = createAsyncThunk(
  'follow/followUser',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      await followService.followUser(targetUserId);
      return targetUserId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to follow user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'follow/unfollowUser',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      await followService.unfollowUser(targetUserId);
      return targetUserId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unfollow user');
    }
  }
);

export const checkFollowingStatus = createAsyncThunk(
  'follow/checkFollowingStatus',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const isFollowing = await followService.checkFollowingStatus(targetUserId);
      return { userId: targetUserId, isFollowing };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check following status');
    }
  }
);

// Initial state
const initialState: FollowState = {
  following: {},
  followers: [],
  loading: false,
  error: null,
};

// Create follow slice
export const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {
    // Synchronous reducers
    clearFollowError: (state) => {
      state.error = null;
    },
    setFollowingStatus: (state, action: PayloadAction<{ userId: string; isFollowing: boolean }>) => {
      const { userId, isFollowing } = action.payload;
      state.following[userId] = isFollowing;
    },
    // Optimistic updates
    toggleFollowOptimistic: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (state.following[userId] !== undefined) {
        state.following[userId] = !state.following[userId];
      } else {
        state.following[userId] = true;
      }
    },
  },
  // Handle async thunk states
  extraReducers: (builder) => {
    builder
      // Follow user
      .addCase(followUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.loading = false;
        state.following[action.payload] = true;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Unfollow user
      .addCase(unfollowUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.loading = false;
        state.following[action.payload] = false;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check following status
      .addCase(checkFollowingStatus.fulfilled, (state, action) => {
        const { userId, isFollowing } = action.payload;
        state.following[userId] = isFollowing;
      })
      .addCase(checkFollowingStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearFollowError, setFollowingStatus, toggleFollowOptimistic } = followSlice.actions;

// Export selectors
export const selectFollowState = (state: { follow: FollowState }) => state.follow;
export const selectFollowingStatus = (state: { follow: FollowState }, userId: string) => 
  state.follow.following[userId] || false;
export const selectFollowLoading = (state: { follow: FollowState }) => state.follow.loading;
export const selectFollowError = (state: { follow: FollowState }) => state.follow.error;

// Export reducer
export default followSlice.reducer;