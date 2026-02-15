import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Define TypeScript interfaces
interface LoadingState {
  // Global loading states
  authLoading: boolean;
  postsLoading: boolean;
  globalLoading: boolean;
  // Specific operation loading states
  [key: string]: boolean;
}

// Action types
type LoadingAction =
  | { type: 'SET_LOADING'; payload: { key: string; isLoading: boolean } }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_POSTS_LOADING'; payload: boolean }
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'CLEAR_LOADING'; payload: string }
  | { type: 'CLEAR_ALL_LOADING' };

// Initial state
const initialState: LoadingState = {
  authLoading: false,
  postsLoading: false,
  globalLoading: false,
};

// Reducer function
function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        [action.payload.key]: action.payload.isLoading,
      };
    case 'SET_AUTH_LOADING':
      return {
        ...state,
        authLoading: action.payload,
      };
    case 'SET_POSTS_LOADING':
      return {
        ...state,
        postsLoading: action.payload,
      };
    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        globalLoading: action.payload,
      };
    case 'CLEAR_LOADING':
      return {
        ...state,
        [action.payload]: false,
      };
    case 'CLEAR_ALL_LOADING':
      return initialState;
    default:
      return state;
  }
}

// Create context
interface LoadingContextType {
  state: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  setAuthLoading: (isLoading: boolean) => void;
  setPostsLoading: (isLoading: boolean) => void;
  setGlobalLoading: (isLoading: boolean) => void;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
  isLoading: (key: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Custom hook to use loading context
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Provider component
interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  // Set loading for a specific key
  const setLoading = useCallback((key: string, isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, isLoading } });
  }, []);

  // Set auth loading
  const setAuthLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_AUTH_LOADING', payload: isLoading });
  }, []);

  // Set posts loading
  const setPostsLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_POSTS_LOADING', payload: isLoading });
  }, []);

  // Set global loading
  const setGlobalLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: isLoading });
  }, []);

  // Clear loading for a specific key
  const clearLoading = useCallback((key: string) => {
    dispatch({ type: 'CLEAR_LOADING', payload: key });
  }, []);

  // Clear all loading states
  const clearAllLoading = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_LOADING' });
  }, []);

  // Check if a specific key is loading
  const isLoading = useCallback((key: string) => {
    return state[key] || false;
  }, [state]);

  const value: LoadingContextType = {
    state,
    setLoading,
    setAuthLoading,
    setPostsLoading,
    setGlobalLoading,
    clearLoading,
    clearAllLoading,
    isLoading,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export default LoadingContext;