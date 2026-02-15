# React Context API Implementation Guide

## 🎯 Overview

This document explains the React Context API implementation for global state management in your social media app. The Context API provides a lighter-weight alternative to Redux while maintaining similar functionality and performance characteristics.

## 📁 File Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx        # Authentication state management
│   ├── PostsContext.tsx       # Posts state management
│   ├── LoadingContext.tsx     # Global loading states
│   └── index.tsx             # Main provider and exports
└── screens/examples/
    └── ContextDemoScreen.tsx  # Demo implementation
```

## 🔧 Core Concepts

### 1. Context Providers
Each context follows the same pattern:
- **State Management**: Uses `useReducer` for predictable state updates
- **Actions**: Defined action types for type safety
- **Custom Hooks**: `useAuth`, `usePosts`, `useLoading` for easy consumption
- **Provider Components**: Wrap app components to provide context values

### 2. State Structure

#### Auth Context State
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

#### Posts Context State
```typescript
interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  hasMore: boolean;
  lastVisible: any;
}
```

#### Loading Context State
```typescript
interface LoadingState {
  authLoading: boolean;
  postsLoading: boolean;
  globalLoading: boolean;
  [key: string]: boolean; // Dynamic loading keys
}
```

## 🚀 Usage Examples

### Basic Usage
```typescript
import { useAuth, usePosts, useLoading } from '../contexts';

const MyComponent = () => {
  const { state: authState, login, logout } = useAuth();
  const { state: postsState, fetchPosts, likePost } = usePosts();
  const { setGlobalLoading, clearAllLoading } = useLoading();

  // Access state
  const { user, isAuthenticated, loading: authLoading } = authState;
  const { posts, loading: postsLoading } = postsState;

  // Perform actions
  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View>
      <Text>Welcome {user?.displayName}</Text>
      {/* Render posts, handle actions, etc. */}
    </View>
  );
};
```

### Optimistic Updates
```typescript
const handleLike = async (postId: string) => {
  // Optimistic update - immediate UI feedback
  toggleLikeOptimistic(postId, user.uid);
  
  try {
    // Actual API call
    await likePost(postId, user.uid);
  } catch (error) {
    // Rollback on failure
    toggleLikeOptimistic(postId, user.uid);
    Alert.alert('Error', 'Failed to like post');
  }
};
```

## ⚡ Performance Optimizations

### 1. Memoization
All context providers use `useCallback` to prevent unnecessary re-renders:
```typescript
const login = useCallback(async (credentials: LoginCredentials) => {
  dispatch({ type: 'LOGIN_START' });
  try {
    const user = await authService.login(credentials);
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
  } catch (error: any) {
    dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
    throw error;
  }
}, []);
```

### 2. Selective Rendering
Components only re-render when their specific context values change:
```typescript
// Only re-renders when auth state changes
const AuthComponent = () => {
  const { state } = useAuth();
  // ...
};

// Only re-renders when posts state changes
const PostsComponent = () => {
  const { state } = usePosts();
  // ...
};
```

### 3. Context Composition
Providers are composed to minimize nesting:
```typescript
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
```

## 🔄 Migration from Redux

### Key Differences

| Redux | Context API |
|-------|-------------|
| Single store | Multiple contexts |
| `useSelector` | Direct state access |
| `useDispatch` | Direct function calls |
| Action creators | Direct async functions |
| Reducers | `useReducer` hooks |

### Migration Example

**Redux Version:**
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts, likePostAsync } from '../store/slices/postsSlice';

const PostsComponent = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(selectPostsLoading);

  const handleLike = (postId) => {
    dispatch(likePostAsync(postId));
  };
};
```

**Context API Version:**
```typescript
import { usePosts } from '../contexts';

const PostsComponent = () => {
  const { state, likePost } = usePosts();
  const { posts, loading } = state;

  const handleLike = (postId) => {
    likePost(postId, user.uid);
  };
};
```

## 🛠️ Best Practices

### 1. Context Separation
Keep contexts separate by concern:
- ✅ Authentication context
- ✅ Posts context  
- ✅ Loading context
- ❌ Single massive context

### 2. Error Handling
Always handle errors gracefully:
```typescript
const handleAction = async () => {
  try {
    await someAsyncAction();
  } catch (error) {
    setError(error.message);
    // Show user-friendly error message
  }
};
```

### 3. Loading States
Use appropriate loading indicators:
```typescript
// Global loading
setGlobalLoading(true);
await fetchData();
clearAllLoading();

// Component-specific loading
setLoading('postId', true);
await likePost(postId);
clearLoading('postId');
```

### 4. Cleanup
Clear loading states and errors appropriately:
```typescript
useEffect(() => {
  return () => {
    clearAllLoading();
    clearError();
  };
}, []);
```

## 📊 Performance Comparison

### Context API Advantages:
- **Lighter weight**: No external dependencies
- **Simpler API**: More intuitive for React developers
- **Better tree shaking**: Only bundles used contexts
- **Easier debugging**: Direct function calls vs. action dispatching

### When to Choose Context vs Redux:
- **Context API**: Small to medium apps, simple state management
- **Redux**: Large apps, complex state interactions, time-travel debugging needed

## 🔧 Troubleshooting

### Common Issues:

1. **"Context not found" errors**
   - Ensure component is wrapped in the appropriate provider
   - Check provider hierarchy in App.tsx

2. **Performance issues**
   - Use `React.memo` for expensive components
   - Split large contexts into smaller ones
   - Memoize callback functions properly

3. **Type errors**
   - Ensure proper TypeScript interfaces
   - Check action type definitions
   - Verify payload structures

## 🎯 Next Steps

1. **Replace existing screens** with Context API versions
2. **Add more contexts** as needed (notifications, themes, etc.)
3. **Implement persistence** for offline support
4. **Add real-time updates** with Firebase listeners
5. **Optimize performance** with React.memo and useMemo

The Context API implementation provides a robust, performant alternative to Redux with familiar React patterns and excellent TypeScript support.