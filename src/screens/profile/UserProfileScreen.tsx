import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Card, Button } from '../../components';
import FollowButton from '../../components/common/FollowButton';
import userService, { UserProfile } from '../../services/userService';
import theme from '../../theme';
import type { RootState } from '../../store';
import { RootStackParamList } from '../../navigation/types';
import { checkFollowingStatus } from '../../store/slices/followSlice';

type UserProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserProfile'>;
type UserProfileScreenRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

const UserProfileScreen: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const route = useRoute<UserProfileScreenRouteProp>();
  
  const { userId } = route.params;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getUserProfile(userId);
      setUserProfile(profile);
      setIsOwnProfile(currentUser?.uid === userId);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile.name
                ? userProfile.name.charAt(0).toUpperCase()
                : (userProfile as any).email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        <Text style={styles.profileName}>{userProfile.name || 'User'}</Text>
        <Text style={styles.profileBio}>{userProfile.bio || 'No bio available'}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatItem label="Posts" value="42" />
          <StatItem label="Followers" value={userProfile.followersCount || 0} />
          <StatItem label="Following" value={userProfile.followingCount || 0} />
        </View>

        {/* Follow Button or Edit Profile Button */}
        {isOwnProfile ? (
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('ProfileSetup' as never)}
          >
            <Icon name="create-outline" size={16} color={theme.colors.white} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.followButtonContainer}>
            <FollowButton 
              targetUserId={userId} 
              size="medium"
              onFollowChange={(isFollowing, followersCount) => {
                // Update local state to reflect the change
                if (userProfile) {
                  setUserProfile({
                    ...userProfile,
                    followersCount: followersCount
                  });
                }
              }}
            />
          </View>
        )}
      </View>

      {/* Profile Actions */}
      <View style={styles.content}>
        <Card style={styles.card}>
          <ProfileAction
            icon="image-outline"
            title="Photos & Videos"
            onPress={() => console.log('View media')}
          />
          {!isOwnProfile && (
            <ProfileAction
              icon="chatbubble-outline"
              title="Send Message"
              onPress={() => console.log('Send message')}
            />
          )}
        </Card>

        <Card style={styles.card}>
          {isOwnProfile ? (
            <>
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
            </>
          ) : (
            <ProfileAction
              icon="information-circle-outline"
              title="About"
              onPress={() => console.log('View about')}
            />
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  profileName: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  profileBio: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: theme.spacing.md,
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
  followButtonContainer: {
    marginTop: theme.spacing.md,
    width: '60%',
  },
});

export default UserProfileScreen;