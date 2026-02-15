import { arrayRemove, arrayUnion, doc, getDoc, getDocs, query, setDoc, updateDoc, where, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from './authService';

const getDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please configure Firebase properly.');
  }
  return db;
};

export const saveUserProfile = async (user: User) => {
  const userRef = doc(getDb(), 'users', user.id);
  await setDoc(
    userRef,
    {
      ...user,
      followers: [],
      following: [],
      keywords: buildKeywords(user),
      updatedAt: new Date(),
    },
    { merge: true }
  );
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(getDb(), 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    keywords: updates.name || updates.email ? buildKeywords({ ...updates, id: userId, email: updates.email || '' } as User) : undefined,
    updatedAt: new Date(),
  });
};

export const searchUsers = async (term: string) => {
  if (!term.trim()) return [];
  const lower = term.toLowerCase();
  const q = query(collection(getDb(), 'users'), where('keywords', 'array-contains', lower));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as User[];
};

export const followUser = async (userId: string, targetId: string) => {
  if (userId === targetId) return;
  const dbInstance = getDb();
  const userRef = doc(dbInstance, 'users', userId);
  const targetRef = doc(dbInstance, 'users', targetId);
  await updateDoc(userRef, { following: arrayUnion(targetId) });
  await updateDoc(targetRef, { followers: arrayUnion(userId) });
};

export const unfollowUser = async (userId: string, targetId: string) => {
  if (userId === targetId) return;
  const dbInstance = getDb();
  const userRef = doc(dbInstance, 'users', userId);
  const targetRef = doc(dbInstance, 'users', targetId);
  await updateDoc(userRef, { following: arrayRemove(targetId) });
  await updateDoc(targetRef, { followers: arrayRemove(userId) });
};

export const getUserProfile = async (userId: string) => {
  const ref = doc(getDb(), 'users', userId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as User & { followers?: string[]; following?: string[] };
};

const buildKeywords = (user: User) => {
  const pool = [user.email, user.name, user.id].filter(Boolean).join(' ').toLowerCase();
  const parts = pool.split(/[\s@._-]+/).filter(Boolean);
  const keywords = new Set<string>();
  parts.forEach(p => {
    keywords.add(p);
    if (p.length > 2) {
      keywords.add(p.slice(0, 3));
    }
  });
  return Array.from(keywords);
};
