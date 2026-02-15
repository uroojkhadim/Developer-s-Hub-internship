import * as Notifications from 'expo-notifications';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { handleNotification, handleNotificationResponse, registerForPushNotifications } from '../services/notificationService';
import { useAuth } from './AuthContext';

type NotificationType = {
  id: string;
  title: string;
  body: string;
  data?: any;
  date: Date;
  read: boolean;
};

type NotificationContextType = {
  notifications: NotificationType[];
  unreadCount: number;
  registerForPushNotifications: () => Promise<string | null>;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const { user } = useAuth();

  // Load saved notifications from storage
  useEffect(() => {
    // In a real app, you would load notifications from AsyncStorage or your backend
    // const savedNotifications = await AsyncStorage.getItem('notifications');
    // if (savedNotifications) {
    //   setNotifications(JSON.parse(savedNotifications));
    // }
  }, []);

  // Save notifications to storage when they change
  useEffect(() => {
    // In a real app, you would save notifications to AsyncStorage
    // AsyncStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Set up notification listeners
  useEffect(() => {
    // Handle notifications received while the app is in the foreground
    const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
    
    // Handle user tapping on a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    // Clean up listeners
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        registerForPushNotifications,
        markAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
