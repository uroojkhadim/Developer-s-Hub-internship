import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Card, Button } from '../../components';
import { useRealtimePosts, useRealtimeLikes, useRealtimeComments } from '../../hooks/useRealtimePosts';
import theme from '../../theme';
import type { Post, Comment } from '../../services/postService';
import postService from '../../services/postService';

/**
 * Real-time demo component showcasing Firebase real-time updates
 * Demonstrates live posts feed, likes, and comments
 */
const RealtimeDemoScreen: React.FC = () => {
  const { posts, loading, error, refresh } = useRealtimePosts(20);
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  // Handle like action with real-time updates
  const handleLike = useCallback(async (postId: string) => {
    try {
      // The likePost function from postService already handles the update
      // Real-time listeners will automatically update the UI
      await postService.likePost(postId);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to like post');
    }
  }, []);

  // Handle comment submission
  const handleAddComment = useCallback(async (postId: string) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      await postService.addComment(postId, commentText);
      // Update local state to clear input
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    }
  }, [newComment]);

  // Handle comment deletion
  const handleDeleteComment = useCallback(async (commentId: string, postId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postService.deleteComment(commentId, postId);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete comment');
            }
          },
        },
      ]
    );
  }, []);

  const renderComment = useCallback(({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Button
          title="Delete"
          variant="outline"
          onPress={() => handleDeleteComment(item.id, item.postId)}
          style={styles.deleteCommentButton}
        />
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentTimestamp}>
        {item.timestamp?.toDate?.().toLocaleString()}
      </Text>
    </View>
  ), [handleDeleteComment]);

  const renderPost = useCallback(({ item }: { item: Post }) => {
    // Get real-time likes for this post
    const { likes, isLiked, loading: likesLoading } = useRealtimeLikes(item.id);
    
    // Get real-time comments for this post
    const { comments, count: commentCount, loading: commentsLoading } = useRealtimeComments(item.id);

    return (
      <Card style={styles.postCard}>
        <View style={styles.postHeader}>
          <View>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.timestamp}>
              {item.timestamp?.toDate?.().toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.content}>{item.content}</Text>

        {item.imageUrl && (
          <View style={styles.imageContainer}>
            <Text style={styles.imagePlaceholder}>🖼️ Image: {item.imageUrl}</Text>
          </View>
        )}

        <View style={styles.interactionsContainer}>
          <Button
            title={`${likes} ${likes === 1 ? 'Like' : 'Likes'}`}
            variant={isLiked ? "primary" : "outline"}
            onPress={() => handleLike(item.id)}
            loading={likesLoading}
            style={styles.likeButton}
          />
          
          <Text style={styles.commentCount}>
            {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
          </Text>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({commentCount})</Text>
          
          {commentsLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(comment) => comment.id}
              scrollEnabled={false}
              style={styles.commentsList}
            />
          )}

          {/* Add Comment Form */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment[item.id] || ''}
              onChangeText={(text) => setNewComment(prev => ({ ...prev, [item.id]: text }))}
              multiline
              numberOfLines={2}
            />
            <Button
              title="Post"
              onPress={() => handleAddComment(item.id)}
              style={styles.postCommentButton}
            />
          </View>
        </View>
      </Card>
    );
  }, [handleLike, handleAddComment, handleDeleteComment, newComment, renderComment]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No Posts Yet</Text>
        <Text style={styles.emptyText}>
          {loading ? 'Loading posts...' : 'Be the first to share something!'}
        </Text>
        {!loading && (
          <Button 
            title="Refresh" 
            onPress={refresh} 
            style={styles.refreshButton} 
          />
        )}
      </Card>
    </View>
  ), [loading, refresh]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            title="Retry" 
            onPress={refresh} 
            style={styles.retryButton} 
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Real-time Feed Demo</Text>
        <Text style={styles.subtitle}>Live updates with Firebase Firestore</Text>
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading real-time posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContainer}
          onRefresh={refresh}
          refreshing={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[300],
  },
  title: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[600],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.light,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
  },
  feedContainer: {
    padding: theme.spacing.sm,
  },
  postCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  username: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
  },
  timestamp: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  content: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  imageContainer: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  imagePlaceholder: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.body2.fontSize,
  },
  interactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  likeButton: {
    minWidth: 100,
  },
  commentCount: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[600],
  },
  commentsSection: {
    marginTop: theme.spacing.md,
  },
  commentsTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
  },
  commentsList: {
    maxHeight: 300,
  },
  commentContainer: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  commentUsername: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
  },
  deleteCommentButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  commentContent: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  commentTimestamp: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  addCommentContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.dark,
    backgroundColor: theme.colors.white,
    minHeight: 40,
  },
  postCommentButton: {
    paddingHorizontal: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  refreshButton: {
    minWidth: 120,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
});

export default RealtimeDemoScreen;