import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { PostProvider } from '../contexts/PostContext';
import { setupNotificationChannel } from '../utils/notificationUtils';

// Configure notification handler
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

export const unstable_settings = {
  anchor: '(tabs)',
};

const AppContent = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let responseListener: Notifications.Subscription;
    
    async function prepare() {
      try {
        // Set up notification channel for Android
        await setupNotificationChannel();
        
        // Set up notification listeners
        responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response received:', response);
          // Handle notification tap here if needed
        });

        // Request permissions for iOS
        if (Platform.OS === 'ios') {
          await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowDisplayInCarPlay: false,
              allowCriticalAlerts: true,
            },
          });
        }

      } catch (e) {
        console.warn('Failed to set up notifications:', e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
    
    return () => {
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  if (!isReady) {
    return null; // Or a loading indicator
  }

  return null;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <PostProvider>
        <NotificationProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
              <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
            </Stack>
            <AppContent />
            <StatusBar style="auto" />
          </ThemeProvider>
        </NotificationProvider>
      </PostProvider>
    </AuthProvider>
  );
}
