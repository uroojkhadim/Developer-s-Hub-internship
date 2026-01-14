import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const setupNotificationChannel = async () => {
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
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const getExpoPushToken = async (): Promise<string | null> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status !== 'granted') {
      const permissionGranted = await requestNotificationPermissions();
      if (!permissionGranted) return null;
    }
    
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};
