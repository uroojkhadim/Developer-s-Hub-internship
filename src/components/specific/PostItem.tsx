import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';

import theme from '../../theme';
import type { Post } from '../../services/postService';

interface PostItemProps {
  post: Post;
  onLikePress: (postId: string) => void;
  onCommentPress: (postId: string) => void;
  onDeletePress?: (postId: string) => void;
  onEditPress?: (post: Post) => void;
  currentUserUid?: string;
  showDeleteOption?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  onLikePress,
  onCommentPress,
  onDeletePress,
  onEditPress,
  currentUserUid,
  showDeleteOption = false,
}) => {
  const isOwnPost = post.userId === currentUserUid;
  const isLiked = post.likedBy?.includes(currentUserUid || '') || false;

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDeletePress?.(post.id),
      },
    ]);
  }, [onDeletePress, post.id]);

  const handleEdit = useCallback(() => {
    onEditPress?.(post);
  }, [onEditPress, post]);

  const handleMenuPress = useCallback(() => {
    if (isOwnPost) {
      Alert.alert(
        'Post Options',
        'Choose an action',
        [
          {
            text: 'Edit',
            onPress: handleEdit,
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: handleDelete,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }
  }, [isOwnPost, handleEdit, handleDelete]);

  const formatTimestamp = (timestamp: any): string => {
    try {
      if (timestamp?.toDate) {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
      }
      return 'Just now';
    } catch (error) {
      return 'Just now';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {post.userAvatar ? (
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{post.username.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
        </View>

        {isOwnPost && showDeleteOption && (
          <TouchableOpacity onPress={handleMenuPress} style={styles.deleteButton}>
            <Icon name="ellipsis-horizontal" size={20} color={theme.colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.postText}>{post.content}</Text>

        {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onLikePress(post.id)}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? theme.colors.danger : theme.colors.gray[600]}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {post.likes > 0 ? post.likes : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onCommentPress(post.id)}>
          <Icon name="chatbubble-outline" size={20} color={theme.colors.gray[600]} />
          <Text style={styles.actionText}>{post.comments > 0 ? post.comments : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-outline" size={20} color={theme.colors.gray[600]} />
          <Text style={styles.actionText}></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: 'bold' as const,
    fontSize: theme.typography.body1.fontSize,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.dark,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  postText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
    paddingVertical: theme.spacing.xs,
  },
  actionText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.xs,
    minWidth: 20,
  },
  likedText: {
    color: theme.colors.danger,
    fontWeight: '600' as const,
  },
});

// Memoized PostItem component to prevent unnecessary re-renders
const MemoizedPostItem = React.memo(PostItem);

export default MemoizedPostItem;
