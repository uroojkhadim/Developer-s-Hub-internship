import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../theme';
import Card from '../common/Card';

interface PostProps {
  id: string;
  username: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: number;
  likedByCurrentUser: boolean;
  onLikePress: (postId: string) => void;
  onCommentPress: (postId: string) => void;
}

const Post: React.FC<PostProps> = ({
  id: _id,
  username,
  content,
  imageUrl,
  likes,
  comments,
  timestamp,
  likedByCurrentUser,
  onLikePress: _onLikePress,
  onCommentPress: _onCommentPress,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.timestamp}>{formatDate(timestamp)}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content}>{content}</Text>

      {/* Image */}
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.postImage} />}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <Icon
            name={likedByCurrentUser ? 'heart' : 'heart-outline'}
            size={20}
            color={likedByCurrentUser ? theme.colors.danger : theme.colors.gray[600]}
          />
          <Text style={styles.actionText}>{likes}</Text>
        </View>

        <View style={styles.actionGroup}>
          <Icon name="chatbubble-outline" size={20} color={theme.colors.gray[600]} />
          <Text style={styles.actionText}>{comments}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[300],
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600' as '600',
    color: theme.colors.dark,
  },
  timestamp: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  content: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
  },
  actionText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.xs,
  },
});

export default Post;
