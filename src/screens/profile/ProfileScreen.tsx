import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Card, Button } from '../../components';
import theme from '../../theme';
import type { RootState } from '../../store';

const ProfileScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();

  const StatItem = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ProfileAction = ({
    icon,
    title,
    onPress,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionIconContainer}>
        <Icon name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Icon name="chevron-forward" size={16} color={theme.colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="camera-outline" size={16} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatItem label="Posts" value="42" />
          <StatItem label="Followers" value="1.2K" />
          <StatItem label="Following" value="356" />
        </View>

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('ProfileSetup' as never)}
        >
          <Icon name="create-outline" size={16} color={theme.colors.white} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Actions */}
      <View style={styles.content}>
        <Card style={styles.card}>
          <ProfileAction
            icon="person-outline"
            title="Edit Profile"
            onPress={() => console.log('Edit profile')}
          />
          <ProfileAction
            icon="image-outline"
            title="Photos & Videos"
            onPress={() => console.log('View media')}
          />
          <ProfileAction
            icon="bookmark-outline"
            title="Saved Items"
            onPress={() => console.log('View saved')}
          />
        </Card>

        <Card style={styles.card}>
          <ProfileAction
            icon="settings-outline"
            title="Settings"
            onPress={() => console.log('Open settings')}
          />
          <ProfileAction
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => console.log('Help center')}
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Share Profile"
            variant="outline"
            onPress={() => console.log('Share profile')}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.white,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  profileName: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.md,
    padding: 0,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  actionIconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  actionTitle: {
    flex: 1,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    marginTop: theme.spacing.md,
  },
  editProfileText: {
    color: theme.colors.white,
    fontWeight: '600' as const,
    fontSize: theme.typography.button.fontSize,
    marginLeft: theme.spacing.sm,
  },
});

export default ProfileScreen;
