import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import { Card } from '../../components';
import { logout } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import theme from '../../theme';
import type { AppDispatch } from '../../store';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
            dispatch(logout());
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, onPress && styles.clickableItem]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        <Icon name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onPress && <Icon name="chevron-forward" size={20} color={theme.colors.gray[400]} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon="person-circle-outline"
          title="Edit Profile"
          subtitle="Update your profile information"
        />
        <SettingItem
          icon="lock-closed-outline"
          title="Change Password"
          subtitle="Update your password"
        />
        <SettingItem
          icon="mail-outline"
          title="Email Preferences"
          subtitle="Manage notification settings"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage app notifications"
        />
        <SettingItem icon="moon-outline" title="Dark Mode" subtitle="Toggle dark theme" />
        <SettingItem icon="language-outline" title="Language" subtitle="English" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          icon="help-circle-outline"
          title="Help Center"
          subtitle="Get help with the app"
        />
        <SettingItem icon="star-outline" title="Rate Us" subtitle="Leave a review" />
        <SettingItem icon="information-circle-outline" title="About" subtitle="App version 1.0.0" />
      </Card>

      <Card style={styles.card}>
        <SettingItem icon="log-out-outline" title="Logout" onPress={handleLogout} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.md,
    padding: 0,
  },
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  clickableItem: {
    backgroundColor: theme.colors.white,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    fontWeight: '500' as const,
  },
  subtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
});

export default SettingsScreen;
