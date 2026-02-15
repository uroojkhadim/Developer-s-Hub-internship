import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import followService from '../../services/followService';

interface FollowButtonProps {
  targetUserId: string;
  initialFollowingStatus?: boolean;
  onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
  size?: 'small' | 'medium' | 'large';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  initialFollowingStatus = false,
  onFollowChange,
  size = 'medium',
}) => {
  const { colors } = useTheme();
  
  const [isFollowing, setIsFollowing] = useState(initialFollowingStatus);
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Load initial following status if not provided
  useEffect(() => {
    const loadInitialStatus = async () => {
      if (initialFollowingStatus === undefined) {
        const status = await followService.checkFollowingStatus(targetUserId);
        setIsFollowing(status);
      }
    };

    loadInitialStatus();
  }, [targetUserId, initialFollowingStatus]);

  const handleFollowToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(targetUserId);
        setIsFollowing(false);
      } else {
        await followService.followUser(targetUserId);
        setIsFollowing(true);
      }

      // Trigger callback if provided
      if (onFollowChange) {
        onFollowChange(!isFollowing, followersCount + (isFollowing ? -1 : 1));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Optionally show error to user
    } finally {
      setLoading(false);
    }
  };

  // Determine button styles based on size
  const getButtonStyles = () => {
    switch (size) {
      case 'small':
        return [styles.smallButton, isFollowing ? styles.unfollowButton : styles.followButton];
      case 'large':
        return [styles.largeButton, isFollowing ? styles.unfollowButton : styles.followButton];
      case 'medium':
      default:
        return [styles.mediumButton, isFollowing ? styles.unfollowButton : styles.followButton];
    }
  };

  const getTextStyles = () => {
    switch (size) {
      case 'small':
        return [styles.smallButtonText, isFollowing ? styles.unfollowButtonText : styles.followButtonText];
      case 'large':
        return [styles.largeButtonText, isFollowing ? styles.unfollowButtonText : styles.followButtonText];
      case 'medium':
      default:
        return [styles.mediumButtonText, isFollowing ? styles.unfollowButtonText : styles.followButtonText];
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), { backgroundColor: isFollowing ? colors.card : colors.primary }]}
      onPress={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFollowing ? colors.text : '#fff'} />
      ) : (
        <Text style={getTextStyles()}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: '#3498db', // Primary blue
  },
  unfollowButton: {
    backgroundColor: '#e74c3c', // Red for unfollow
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mediumButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  largeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  followButtonText: {
    color: '#fff',
  },
  unfollowButtonText: {
    color: '#fff',
  },
});

export default FollowButton;