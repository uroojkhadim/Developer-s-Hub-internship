import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import followReducer from './slices/followSlice';

// Configure Redux store with proper middleware and dev tools
export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    follow: followReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Disable serializable check for Firebase objects
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'auth/setUser', 'auth/loginSuccess'],
        ignoredPaths: ['auth.user', 'posts.posts'],
      },
      // Enable thunk for async operations
      thunk: true,
    }),
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type for dispatching actions - extended for thunk support
export type AppDispatch = typeof store.dispatch;

// Typed hooks for easier usage in components
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export store for Provider
export default store;
