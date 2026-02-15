import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  Unsubscribe,
  startAfter,
} from 'firebase/firestore';
import { auth } from '../config/firebase';
import userService from './userService';

export interface Chat {
  id: string;
  participants: string[];
  createdAt: number;
  updatedAt: number;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
    type: string;
  };
  unreadCounts: Record<string, number>;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
  read: boolean;
  type: string;
  status: string;
}

export interface CreateMessageData {
  text: string;
  receiverId: string;
  chatId?: string;
}

export interface ChatQueryParams {
  limit?: number;
  lastVisible?: any;
}

class ChatService {
  private db = getFirestore();
  private chatsCollection = collection(this.db, 'chats');

  /**
   * Create a new chat between two users
   */
  async createChat(userIds: string[]): Promise<Chat> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      if (userIds.length !== 2) {
        throw new Error('Chat must have exactly 2 participants');
      }

      // Sort user IDs to ensure consistent chat ID
      const sortedUserIds = [...userIds].sort();
      const chatId = `${sortedUserIds[0]}_${sortedUserIds[1]}`;

      const chatRef = doc(this.db, 'chats', chatId);
      const chatData: Chat = {
        id: chatId,
        participants: sortedUserIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        unreadCounts: {
          [sortedUserIds[0]]: 0,
          [sortedUserIds[1]]: 0,
        },
      };

      await setDoc(chatRef, chatData);
      return chatData;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  /**
   * Get or create a chat between two users
   */
  async getOrCreateChat(receiverId: string): Promise<Chat> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUserId = auth.currentUser.uid;
      const sortedUserIds = [currentUserId, receiverId].sort();
      const chatId = `${sortedUserIds[0]}_${sortedUserIds[1]}`;

      // Try to get existing chat
      const chatRef = doc(this.db, 'chats', chatId);
      const chatSnap = await this.getChatById(chatId);

      if (chatSnap) {
        return chatSnap;
      }

      // Create new chat if it doesn't exist
      return await this.createChat([currentUserId, receiverId]);
    } catch (error) {
      console.error('Error getting or creating chat:', error);
      throw error;
    }
  }

  /**
   * Get a chat by ID
   */
  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const chatDoc = await getDoc(doc(this.db, 'chats', chatId));
      if (chatDoc.exists()) {
        return { id: chatDoc.id, ...chatDoc.data() } as Chat;
      }
      return null;
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      throw error;
    }
  }

  /**
   * Get all chats for the current user
   */
  async getUserChats(params: ChatQueryParams = {}): Promise<{ chats: Chat[]; lastVisible: any }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUserId = auth.currentUser.uid;

      let q = query(
        this.chatsCollection,
        where('participants', 'array-contains', currentUserId),
        orderBy('updatedAt', 'desc')
      );

      if (params.limit) {
        q = query(q, limit(params.limit));
      }

      if (params.lastVisible) {
        q = query(q, startAfter(params.lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const chats: Chat[] = [];

      for (const doc of querySnapshot.docs) {
        const chatData = doc.data();
        chats.push({
          id: doc.id,
          ...chatData,
        } as Chat);
      }

      return {
        chats,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error('Error getting user chats:', error);
      throw error;
    }
  }

  /**
   * Send a message in a chat
   */
  async sendMessage(messageData: CreateMessageData): Promise<Message> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUserId = auth.currentUser.uid;
      const { text, receiverId, chatId: providedChatId } = messageData;

      // Get or create chat if not provided
      let chatId = providedChatId;
      if (!chatId) {
        const chat = await this.getOrCreateChat(receiverId);
        chatId = chat.id;
      }

      if (!chatId) {
        throw new Error('Could not create or find chat');
      }

      // Create message document
      const messagesCollection = collection(this.db, `chats/${chatId}/messages`);
      const messageRef = await addDoc(messagesCollection, {
        text,
        senderId: currentUserId,
        receiverId,
        timestamp: Date.now(),
        read: false,
        type: 'text',
        status: 'sent',
      });

      // Get the created message
      const messageSnap = await getDoc(messageRef);
      const message = {
        id: messageSnap.id,
        ...messageSnap.data(),
      } as Message;

      // Update chat document with last message info
      const chatRef = doc(this.db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          text,
          senderId: currentUserId,
          timestamp: Date.now(),
          type: 'text',
        },
        updatedAt: Date.now(),
        [`unreadCounts.${receiverId}`]: this.incrementUnreadCount(chatId, receiverId),
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific chat
   */
  async getMessages(chatId: string, params: ChatQueryParams = {}): Promise<{ messages: Message[]; lastVisible: any }> {
    try {
      const messagesCollection = collection(this.db, `chats/${chatId}/messages`);

      let q = query(messagesCollection, orderBy('timestamp', 'asc'));

      if (params.limit) {
        q = query(q, limit(params.limit));
      }

      if (params.lastVisible) {
        q = query(q, startAfter(params.lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];

      for (const doc of querySnapshot.docs) {
        const messageData = doc.data();
        messages.push({
          id: doc.id,
          ...messageData,
        } as Message);
      }

      return {
        messages,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read in a chat
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const messagesCollection = collection(this.db, `chats/${chatId}/messages`);
      const q = query(
        messagesCollection,
        where('receiverId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);

      // Update each unread message to mark as read
      const batchPromises = querySnapshot.docs.map(async (doc) => {
        const messageRef = doc(this.db, `chats/${chatId}/messages`, doc.id);
        return updateDoc(messageRef, { read: true });
      });

      await Promise.all(batchPromises);

      // Update unread count in chat document
      const chatRef = doc(this.db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCounts.${userId}`]: 0,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time chat updates for a user
   */
  subscribeToUserChats(
    userId: string,
    callback: (chats: Chat[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const q = query(
      this.chatsCollection,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const chats: Chat[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          chats.push({
            id: doc.id,
            ...data,
          } as Chat);
        });

        callback(chats);
      },
      (error) => {
        console.error('Error in chat subscription:', error);
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );
  }

  /**
   * Subscribe to real-time messages in a specific chat
   */
  subscribeToChatMessages(
    chatId: string,
    callback: (messages: Message[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const messagesCollection = collection(this.db, `chats/${chatId}/messages`);
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const messages: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            ...data,
          } as Message);
        });

        callback(messages);
      },
      (error) => {
        console.error('Error in message subscription:', error);
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );
  }

  /**
   * Helper function to increment unread count
   */
  private incrementUnreadCount(chatId: string, userId: string): number {
    // This is a placeholder implementation
    // In a real scenario, you'd need to fetch the current count and increment
    // For Firestore, we'd typically handle this in the client or with a Cloud Function
    return 1; // Placeholder value
  }
}

export default new ChatService();