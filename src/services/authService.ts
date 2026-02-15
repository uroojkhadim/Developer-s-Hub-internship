import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthError {
  code: string;
  message: string;
}

class AuthService {
  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // Store in secure storage
      await Keychain.setGenericPassword(
        'userTokens',
        JSON.stringify({
          accessToken,
          refreshToken,
        })
      );

      // Store user data in AsyncStorage
      await AsyncStorage.setItem(
        'userData',
        JSON.stringify({
          email: auth.currentUser?.email,
          uid: auth.currentUser?.uid,
        })
      );
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  private async getStoredTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        return JSON.parse(credentials.password);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Store tokens securely
      await this.storeTokens(
        await userCredential.user.getIdToken(),
        '' // Firebase handles refresh tokens internally
      );

      return userCredential.user;
    } catch (error: any) {
      const authError: AuthError = {
        code: error.code,
        message: this.mapFirebaseError(error.code),
      };
      throw authError;
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

      // Store tokens securely
      await this.storeTokens(await userCredential.user.getIdToken(), '');

      return userCredential.user;
    } catch (error: any) {
      const authError: AuthError = {
        code: error.code,
        message: this.mapFirebaseError(error.code),
      };
      throw authError;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      await Keychain.resetGenericPassword();
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const authError: AuthError = {
        code: error.code,
        message: this.mapFirebaseError(error.code),
      };
      throw authError;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  private mapFirebaseError(code: string): string {
    const errorMap: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account already exists with this email address.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    };

    return errorMap[code] || 'An unexpected error occurred. Please try again.';
  }
}

export default new AuthService();
