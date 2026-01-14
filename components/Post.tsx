import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post as PostType } from '../types/post';

interface PostProps {
  post: PostType;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onEdit: (post: PostType) => void;
  onDelete: (postId: string) => void;
  currentUserId: string;
}

const Post: React.FC<PostProps> = ({ post, onLike, onComment, onEdit, onDelete, currentUserId }) => {
  const navigation = useNavigation(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const isLiked = post.likes.includes(currentUserId);
  const likeCount = post.likes.length;
  const commentCount = post.comments.length;
  const isOwner = post.userId === currentUserId;

  const navigateToProfile = () => {
    // In a real app, navigate to the user's profile
    // navigation.navigate('UserProfile', { userId: post.userId });
  };

  const navigateToPost = () => {
    // In a real app, navigate to the post detail screen
    // navigation.navigate('PostDetail', { postId: post.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToProfile} style={styles.userInfo}>
          {post.userAvatar ? (
            <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialIcons name="person" size={24} color="#666" />
            </View>
          )}
          <View>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </TouchableOpacity>
        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity onPress={() => onEdit(post)} style={styles.ownerButton}>
              <MaterialIcons name="edit" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.ownerButton}>
              <MaterialIcons name="delete" size={20} color="#e53935" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={navigateToPost} style={styles.contentContainer}>
        <Text style={styles.content}>{post.content}</Text>
        {post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
        >
          <MaterialIcons 
            name={isLiked ? 'favorite' : 'favorite-border'} 
            size={24} 
            color={isLiked ? '#ff4444' : '#666'} 
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {likeCount > 0 ? likeCount : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onComment(post.id)}
        >
          <MaterialIcons name="chat-bubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>
            {commentCount > 0 ? commentCount : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="share-outline" size={24} color="#666" />
          <Text style={styles.actionText}></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontWeight: '600',
    fontSize: 15,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 10,
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerButton: {
    marginLeft: 10,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#ff4444',
    fontWeight: '600',
  },
});

export default Post;
