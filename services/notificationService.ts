import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { Alert, Platform } from 'react-native';
import { app } from '../config/firebase';

// Define types for Firebase messaging
import type { FirebaseApp } from 'firebase/app';
import type { Messaging } from 'firebase/messaging';

const firebaseApp = app as FirebaseApp | null;

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  } as Notifications.NotificationBehavior),
});

// Listen for FCM messages when the app is in the foreground
let messaging: Messaging | null = null;
if (firebaseApp) {
  messaging = getMessaging(firebaseApp);
  onMessage(messaging, (message) => {
    // Handle the received message
    const { title, body } = message.notification || {};
    if (title && body) {
      showLocalNotification(title, body, message.data);
    }
  });
} else {
  console.warn('Firebase app not initialized, skipping FCM setup');
}

// Show a local notification
const showLocalNotification = async (title: string, body: string, data: any = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: 'high',
      },
      trigger: null, // null means show immediately
    } as Notifications.NotificationRequestInput);
  } catch (error) {
    console.error('Error showing local notification:', error);
  }
};

export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    let token: string | null = null;
    
    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: true,
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission required',
        'Push notifications need the appropriate permissions to work properly.'
      );
      return null;
    }

    // Get FCM token
    try {
      if (messaging) {
        token = await getToken(messaging, {
          vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
        });
      } else {
        console.warn('Messaging not available, skipping FCM token generation');
      }
      
      if (!token) {
        // Fallback to Expo's push token if FCM token is not available
        const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
        token = expoPushToken;
      }
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      // Fallback to Expo's push token if FCM fails
      try {
        const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
        return expoPushToken;
      } catch (expoError) {
        console.error('Error getting Expo push token:', expoError);
        return null;
      }
    }
  } catch (error) {
    console.error('Error in registerForPushNotifications:', error);
    return null;
  }
};

// Handle notifications when the app is in the foreground
export const handleNotification = async (notification: Notifications.Notification) => {
  console.log('Notification received:', notification);
  
  // You can customize how notifications are handled when received
  const { title, body, data } = notification.request.content;
  
  // Example: Show an alert for the notification
  if (Platform.OS === 'web') {
    Alert.alert(title || 'New Notification', body || '');
  }
  
  // Return true to keep the notification in the notification tray
  return true;
};

// Handle notification responses (when user taps on the notification)
export const handleNotificationResponse = (
  response: Notifications.NotificationResponse
) => {
  const { notification } = response;
  const { title, body, data } = notification.request.content;
  
  console.log('Notification tapped:', { title, body, data });
  
  // You can navigate to a specific screen based on the notification data
  // Example:
  // if (data?.screen) {
  //   navigation.navigate(data.screen, data.params);
  // }
};

// Schedule a local notification
export const scheduleLocalNotification = async (
  title: string, 
  body: string, 
  data: any = {},
  trigger: Date | number | null = null
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: 'high',
        autoDismiss: true,
        sticky: false,
        vibrate: [0, 250, 250, 250],
      },
      trigger: trigger || null,
    } as Notifications.NotificationRequestInput);
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

// Send a push notification to a specific device using Expo's push service
export const sendPushNotification = async (
  expoPushToken: string, 
  title: string, 
  body: string, 
  data: any = {}
): Promise<boolean> => {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data?.status === 'ok') {
      console.log('Push notification sent successfully');
      return true;
    } else {
      console.error('Failed to send push notification:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};
