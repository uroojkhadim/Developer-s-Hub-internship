import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import authService from '../services/authService';

// Define TypeScript interfaces
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_FAILURE'; payload: string }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_PASSWORD_START' }
  | { type: 'RESET_PASSWORD_SUCCESS' }
  | { type: 'RESET_PASSWORD_FAILURE'; payload: string };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true, // Start with true to check auth state
  error: null,
};

// Reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'LOGOUT_FAILURE':
    case 'RESET_PASSWORD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...initialState,
        loading: false, // Keep loading false after logout
      };
    case 'SET_USER':
      return {
        ...state,
        isAuthenticated: !!action.payload,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET_PASSWORD_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'RESET_PASSWORD_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

// Create context
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication state on app start
  const checkAuthState = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_USER', payload: null });
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authService.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const user = await authService.register(data);
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error: any) {
      dispatch({ type: 'REGISTER_FAILURE', payload: error.message || 'Registration failed' });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT_START' });
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (error: any) {
      dispatch({ type: 'LOGOUT_FAILURE', payload: error.message || 'Logout failed' });
      // Still clear local state even if backend fails
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    dispatch({ type: 'RESET_PASSWORD_START' });
    try {
      await authService.resetPassword(email);
      dispatch({ type: 'RESET_PASSWORD_SUCCESS' });
    } catch (error: any) {
      dispatch({ type: 'RESET_PASSWORD_FAILURE', payload: error.message || 'Password reset failed' });
      throw error;
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check auth state on mount
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    resetPassword,
    clearError,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;