import React from 'react';
import { AuthProvider } from './AuthContext';
import { PostsProvider } from './PostsContext';
import { LoadingProvider } from './LoadingContext';

// Combine all providers into one main provider
interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Main provider that wraps the entire app with all context providers
 * This ensures proper context hierarchy and avoids deeply nested providers
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <LoadingProvider>
      <AuthProvider>
        <PostsProvider>
          {children}
        </PostsProvider>
      </AuthProvider>
    </LoadingProvider>
  );
};

// Re-export all custom hooks for convenience
export { useAuth } from './AuthContext';
export { usePosts } from './PostsContext';
export { useLoading } from './LoadingContext';

// Re-export provider components if needed individually
export { AuthProvider, PostsProvider, LoadingProvider };