import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification, NotificationType } from '../models/Notification';
import notificationService from '../services/notificationService';
import { auth } from '../config/firebase';

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  unsubscribe: () => void;
}

/**
 * Custom hook for real-time notifications
 */
export const useNotifications = (limit: number = 20): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      setNotifications([]);
      return;
    }

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications(
      (newNotifications) => {
        // Limit the notifications to specified count
        const limitedNotifications = newNotifications.slice(0, limit);
        setNotifications(limitedNotifications);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [limit]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unsubscribe,
  };
};

interface UseUnreadCountReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  unsubscribe: () => void;
}

/**
 * Custom hook for real-time unread notifications count
 */
export const useUnreadCount = (): UseUnreadCountReturn => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      setUnreadCount(0);
      return;
    }

    // Subscribe to real-time unread count
    const unsubscribe = notificationService.subscribeToUnreadCount(
      (count) => {
        setUnreadCount(count);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, []);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  return {
    unreadCount,
    loading,
    error,
    refresh,
    unsubscribe,
  };
};

interface UseNotificationSetupReturn {
  isSupported: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  fcmToken: string | null;
}

/**
 * Custom hook for notification setup and permission management
 */
export const useNotificationSetup = (): UseNotificationSetupReturn => {
  const [hasPermission, setHasPermission] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const isSupported = notificationService.isMessagingSupported();

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestNotificationPermission();
      if (granted) {
        setHasPermission(true);
        setFcmToken(notificationService.getFCMTokenValue());
      }
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Check initial permission status
  useEffect(() => {
    if (isSupported && auth.currentUser) {
      setFcmToken(notificationService.getFCMTokenValue());
    }
  }, [isSupported]);

  return {
    isSupported,
    hasPermission,
    requestPermission,
    fcmToken,
  };
};

// Utility functions for creating notifications
export const createLikeNotification = async (
  recipientId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | null,
  postId: string
): Promise<void> => {
  try {
    await notificationService.createNotification({
      recipientId,
      senderId,
      senderName,
      senderAvatar,
      type: NotificationType.LIKE,
      title: `${senderName} liked your post`,
      body: 'Someone liked your post',
      postId
    });
  } catch (error) {
    console.error('Error creating like notification:', error);
  }
};

export const createCommentNotification = async (
  recipientId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | null,
  postId: string,
  commentBody: string
): Promise<void> => {
  try {
    await notificationService.createNotification({
      recipientId,
      senderId,
      senderName,
      senderAvatar,
      type: NotificationType.COMMENT,
      title: `${senderName} commented on your post`,
      body: commentBody.substring(0, 100) + (commentBody.length > 100 ? '...' : ''),
      postId
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
  }
};