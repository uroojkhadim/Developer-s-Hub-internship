import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  where, 
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { auth } from '../config/firebase';
import { 
  Notification, 
  NotificationType, 
  CreateNotificationData, 
  NotificationQueryParams 
} from '../models/Notification';

class NotificationService {
  private db = getFirestore();
  private messagingSupported = false;
  private fcmToken: string | null = null;
  private notificationsCollection = collection(this.db, 'notifications');

  constructor() {
    this.initializeMessaging();
  }

  private async initializeMessaging() {
    try {
      this.messagingSupported = await isSupported();
      if (this.messagingSupported && auth.currentUser) {
        await this.requestNotificationPermission();
      }
    } catch (error) {
      console.warn('FCM initialization failed:', error);
    }
  }

  /**
   * Request notification permission from user
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!this.messagingSupported) return false;

    try {
      // In React Native, notification permission is handled differently
      // This is a placeholder - actual implementation depends on react-native-firebase/messaging
      console.log('Requesting notification permission');
      
      // For now, just get FCM token
      await this.getFCMToken();
      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token for device
   */
  private async getFCMToken(): Promise<string | null> {
    if (!this.messagingSupported) return null;

    try {
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' // Replace with your VAPID key
      });
      
      if (token) {
        this.fcmToken = token;
        // Store token in user document
        if (auth.currentUser) {
          const userRef = doc(this.db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, {
            fcmToken: token,
            fcmTokenUpdatedAt: Timestamp.now()
          });
        }
      }
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const notificationData = {
        ...data,
        read: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.notificationsCollection, notificationData);
      
      // Get the created notification
      const notificationDoc = await getDoc(docRef);
      
      if (!notificationDoc.exists()) {
        throw new Error('Failed to create notification');
      }
      
      const docData = notificationDoc.data();
      const notification: Notification = {
        id: notificationDoc.id,
        ...docData,
        createdAt: docData.createdAt.toDate(),
        updatedAt: docData.updatedAt.toDate()
      } as Notification;

      // Send push notification if recipient has FCM token
      await this.sendPushNotification(notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Send push notification via FCM
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Get recipient's FCM token
      const recipientRef = doc(this.db, 'users', notification.recipientId);
      const recipientDoc = await getDoc(recipientRef);
      
      if (!recipientDoc.exists()) return;
      
      const recipientData = recipientDoc.data();
      const fcmToken = recipientData.fcmToken;
      
      if (!fcmToken) return;

      // In a real app, this would be sent to your backend server
      // which would then use the FCM HTTP API to send the notification
      console.log('Would send push notification to:', fcmToken);
      console.log('Notification data:', {
        title: notification.title,
        body: notification.body,
        data: {
          notificationId: notification.id,
          type: notification.type,
          postId: notification.postId
        }
      });

      // Simulate sending notification (in production, call your backend API)
      // await fetch('https://your-backend.com/send-notification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     token: fcmToken,
      //     title: notification.title,
      //     body: notification.body,
      //     data: {
      //       notificationId: notification.id,
      //       type: notification.type,
      //       postId: notification.postId
      //     }
      //   })
      // });

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Get notifications for current user
   */
  async getNotifications(params: NotificationQueryParams = {}): Promise<{ 
    notifications: Notification[]; 
    lastVisible: any 
  }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const { limit: limitCount = 20, lastVisible, unreadOnly = false } = params;
      
      let q = query(
        this.notificationsCollection,
        where('recipientId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Filter by read status if requested
      if (unreadOnly) {
        q = query(q, where('read', '==', false));
      }

      // Add pagination if lastVisible provided
      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const notifications: Notification[] = [];
      let lastDoc = null;

      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        } as Notification);
        lastDoc = doc;
      });

      return { notifications, lastVisible: lastDoc };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(this.db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      if (!auth.currentUser) return;

      const q = query(
        this.notificationsCollection,
        where('recipientId', '==', auth.currentUser.uid),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      
      const batchUpdates = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          read: true,
          updatedAt: Timestamp.now()
        })
      );

      await Promise.all(batchUpdates);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(this.db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    try {
      if (!auth.currentUser) return 0;

      const q = query(
        this.notificationsCollection,
        where('recipientId', '==', auth.currentUser.uid),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Real-time listener for notifications
   */
  subscribeToNotifications(
    callback: (notifications: Notification[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    if (!auth.currentUser) {
      errorCallback?.(new Error('User not authenticated'));
      return () => {};
    }

    const q = query(
      this.notificationsCollection,
      where('recipientId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications: Notification[] = [];
        snapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate()
          } as Notification);
        });
        callback(notifications);
      },
      (error) => {
        console.error('Error in notifications listener:', error);
        errorCallback?.(error);
      }
    );
  }

  /**
   * Real-time listener for unread count
   */
  subscribeToUnreadCount(
    callback: (count: number) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    if (!auth.currentUser) {
      errorCallback?.(new Error('User not authenticated'));
      return () => {};
    }

    const q = query(
      this.notificationsCollection,
      where('recipientId', '==', auth.currentUser.uid),
      where('read', '==', false)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshot.size);
      },
      (error) => {
        console.error('Error in unread count listener:', error);
        errorCallback?.(error);
      }
    );
  }

  /**
   * Handle foreground messages
   */
  onForegroundMessage(callback: (payload: any) => void): void {
    if (!this.messagingSupported) return;

    try {
      const messaging = getMessaging();
      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
      });
    } catch (error) {
      console.error('Error setting up foreground message handler:', error);
    }
  }

  /**
   * Get current FCM token
   */
  getFCMTokenValue(): string | null {
    return this.fcmToken;
  }

  /**
   * Check if messaging is supported
   */
  isMessagingSupported(): boolean {
    return this.messagingSupported;
  }
}

export default new NotificationService();