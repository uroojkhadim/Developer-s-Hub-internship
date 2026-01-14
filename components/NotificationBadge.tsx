import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { RootStackParamList } from '../types/navigation';

const NotificationBadge: React.FC = () => {
  const { unreadCount } = useNotifications();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.badgeContainer}
      onPress={() => router.push('/notifications')}
    >
      <MaterialIcons name="notifications" size={24} color="#fff" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'relative',
    marginRight: 15,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
