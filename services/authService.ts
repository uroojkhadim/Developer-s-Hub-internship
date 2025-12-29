import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

// Define user type
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
}

// Define auth service interface
interface AuthService {
  signUp: (email: string, password: string, name?: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Mock auth service implementation
class MockAuthService implements AuthService {
  private currentUser: User | null = null;
  private users: Record<string, User> = {};

  async signUp(email: string, password: string, name?: string): Promise<User | null> {
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if user already exists
    if (this.users[email]) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name: name || email.split('@')[0],
    };

    this.users[email] = newUser;
    this.currentUser = newUser;

    // Save to AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    
    return newUser;
  }

  async login(email: string, password: string): Promise<User | null> {
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if user exists
    const user = this.users[email];
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In a real app, you'd verify the password
    // For mock service, we'll just proceed
    this.currentUser = user;

    // Save to AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem('user');
  }

  async forgotPassword(email: string): Promise<void> {
    // In a real app, this would send a password reset email
    // For mock service, just return
    console.log('Password reset email would be sent to:', email);
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to get from AsyncStorage
    const userString = await AsyncStorage.getItem('user');
    if (userString) {
      this.currentUser = JSON.parse(userString);
      return this.currentUser;
    }

    return null;
  }

  async updateProfile(userData: Partial<User>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user is currently logged in');
    }

    // Update user data
    this.currentUser = {
      ...this.currentUser,
      ...userData,
    };

    // Update in users record
    if (this.users[this.currentUser.email]) {
      this.users[this.currentUser.email] = this.currentUser;
    }

    // Save to AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(this.currentUser));
  }
}

// Firebase auth service implementation
class FirebaseAuthService implements AuthService {
  async signUp(email: string, password: string, name?: string): Promise<User | null> {
    if (!auth) {
      // Fallback to mock if Firebase is not configured
      const mockAuth = new MockAuthService();
      return mockAuth.signUp(email, password, name);
    }

    // Firebase sign up implementation
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (name && user) {
      await updateProfile(user, { displayName: name });
    }

    // Return user object
    return {
      id: user.uid,
      email: user.email || '',
      name: name || user.displayName || email.split('@')[0],
    };
  }

  async login(email: string, password: string): Promise<User | null> {
    if (!auth) {
      // Fallback to mock if Firebase is not configured
      const mockAuth = new MockAuthService();
      return mockAuth.login(email, password);
    }

    // Firebase login implementation
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || email.split('@')[0],
    };
  }

  async logout(): Promise<void> {
    if (!auth) {
      // Fallback to mock if Firebase is not configured
      const mockAuth = new MockAuthService();
      return mockAuth.logout();
    }

    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  }

  async forgotPassword(email: string): Promise<void> {
    if (!auth) {
      // Fallback to mock if Firebase is not configured
      const mockAuth = new MockAuthService();
      return mockAuth.forgotPassword(email);
    }

    // Firebase password reset implementation
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!auth) {
      // Fallback to mock if Firebase is not configured
      const mockAuth = new MockAuthService();
      return mockAuth.getCurrentUser();
    }

    // Check if user is already authenticated with Firebase
    if (auth.currentUser) {
      return {
        id: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || '',
      };
    }

    // Fallback to AsyncStorage if Firebase is not initialized
    const userString = await AsyncStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString);
    }

    return null;
  }

  async updateProfile(userData: Partial<User>): Promise<void> {
    if (!auth) {
      // Fallback to mock if Firebase is not configured
      const mockAuth = new MockAuthService();
      return mockAuth.updateProfile(userData);
    }

    if (auth.currentUser) {
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(auth.currentUser, {
        displayName: userData.name,
      });
    }
  }
}

// Create auth service instance
export const authService = new FirebaseAuthService();