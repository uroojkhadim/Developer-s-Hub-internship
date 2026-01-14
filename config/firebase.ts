// Import the functions you need from the SDKs you need
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || ""
};

let app: FirebaseApp | null;
let auth: Auth | null;
let db: Firestore | null;
let storage: any | null; // Firebase storage doesn't export a type

// Initialize Firebase app only if config values are present
if (firebaseConfig.apiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization error:', error);
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
} else {
  // Set to null if no config is provided
  app = null;
  auth = null;
  db = null;
  storage = null;
  console.warn('Firebase not configured. Using mock authentication.');
}

export { app, auth, db, storage };

export default { app, auth, db, storage };