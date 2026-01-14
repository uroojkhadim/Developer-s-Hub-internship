import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const getDb = () => {
  if (!db) throw new Error('Firestore is not initialized. Please configure Firebase.');
  return db;
};

const chatIdForUsers = (a: string, b: string) => {
  return [a, b].sort().join('_');
};

export const sendMessage = async (from: string, to: string, text: string) => {
  const chatId = chatIdForUsers(from, to);
  const dbInstance = getDb();
  const chatRef = doc(dbInstance, 'chats', chatId);
  await setDoc(
    chatRef,
    { users: [from, to], updatedAt: serverTimestamp(), lastMessage: text },
    { merge: true }
  );
  await addDoc(collection(chatRef, 'messages'), {
    from,
    to,
    text,
    createdAt: serverTimestamp(),
    status: 'sent',
  });
  return chatId;
};

export const subscribeToMessages = (userA: string, userB: string, cb: (msgs: any[]) => void) => {
  const chatId = chatIdForUsers(userA, userB);
  const msgsRef = collection(getDb(), 'chats', chatId, 'messages');
  const q = query(msgsRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    const messages = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    cb(messages);
  });
};
