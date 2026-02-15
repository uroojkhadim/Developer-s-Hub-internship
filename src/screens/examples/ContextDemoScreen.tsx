import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Card, Button } from '../../components';
import { useAuth, usePosts, useLoading } from '../../contexts';
import theme from '../../theme';
import type { Post } from '../../services/postService';

/**
 * Demonstration component showing Context API usage
 * This replaces the Redux-based FeedScreen with Context API implementation
 */
const ContextDemoScreen: React.FC = () => {
  // Use all three contexts
  const { state: authState, logout } = useAuth();
  const { 
    state: postsState, 
    fetchPosts, 
    likePost, 
    deletePost,
    toggleLikeOptimistic 
  } = usePosts();
  const { setGlobalLoading, clearAllLoading } = useLoading();

  const { posts, loading, error, hasMore, lastVisible } = postsState;
  const { user } = authState;

  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setGlobalLoading(true);
      }
      await fetchPosts({
        limit: 10,
        ...(isRefresh ? {} : { lastVisible }),
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load posts');
    } finally {
      if (isRefresh) {
        clearAllLoading();
      }
    }
  }, [fetchPosts, lastVisible, setGlobalLoading, clearAllLoading]);

  const handleLikePress = useCallback(async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      // Optimistic update
      toggleLikeOptimistic(postId, user.uid);
      
      // Actual API call
      await likePost(postId, user.uid);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to like post');
      // Revert optimistic update on failure
      toggleLikeOptimistic(postId, user.uid);
    }
  }, [likePost, toggleLikeOptimistic, user?.uid]);

  const handleDeletePress = useCallback(async (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(postId);
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete post');
            }
          },
        },
      ]
    );
  }, [deletePost]);

  const handleRefresh = useCallback(() => {
    loadPosts(true);
  }, [loadPosts]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && lastVisible && !loading) {
      loadPosts();
    }
  }, [hasMore, lastVisible, loading, loadPosts]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Logout failed');
    }
  }, [logout]);

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.username}>{item.username}</Text>
        {item.userId === user?.uid && (
          <Button 
            title="Delete" 
            variant="outline" 
            onPress={() => handleDeletePress(item.id)}
          />
        )}
      </View>
      <Text style={styles.content}>{item.content}</Text>
      {item.imageUrl && (
        <View style={styles.imageContainer}>
          {/* Image component would go here */}
          <Text>Image: {item.imageUrl}</Text>
        </View>
      )}
      <View style={styles.postFooter}>
        <Button 
          title={`Like (${item.likes})`} 
          variant={item.likedBy?.includes(user?.uid || '') ? "primary" : "outline"}
          onPress={() => handleLikePress(item.id)}
        />
        <Text style={styles.timestamp}>
          {item.timestamp?.toDate?.().toLocaleDateString()}
        </Text>
      </View>
    </Card>
  ), [user?.uid, handleDeletePress, handleLikePress]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loading]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No Posts Yet</Text>
        <Text style={styles.emptyText}>Be the first to share something!</Text>
      </Card>
    </View>
  ), []);

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Context API Demo</Text>
        <Button 
          title="Logout" 
          variant="outline" 
          onPress={handleLogout}
        />
      </View>
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={posts.length === 0 ? styles.centerContent : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[300],
  },
  title: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
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
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
  },
  postCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  username: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
  },
  content: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  imageContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[600],
  },
  footerLoader: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
});

export default ContextDemoScreen;