import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import PostItem from '../../components/specific/PostItem';
import EditPostModal from '../../components/modals/EditPostModal';
import { Button, Card } from '../../components';
import {
  fetchPosts,
  fetchFollowedPosts,
  likePostAsync,
  deletePost,
  updatePost,
  toggleLikeOptimistic,
} from '../../store/slices/postsSlice';
import { selectFeedData, selectUserData, selectLastVisible } from '../../store/helpers/selectors';
import theme from '../../theme';
import type { RootState, AppDispatch } from '../../store';
import type { Post } from '../../services/postService';

const FeedScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // State for feed type
  const [feedType, setFeedType] = useState<'all' | 'followed'>('all');
  
  // State for edit modal
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use Redux state instead of local state
  const { posts, loading, refreshing, hasMore, error } = useSelector(selectFeedData);
  const lastVisible = useSelector(selectLastVisible);
  
  const loadPosts = useCallback(
    (isRefresh = false) => {
      if (feedType === 'followed') {
        dispatch(fetchFollowedPosts({
          limit: 10,
          ...(isRefresh ? {} : { lastVisible }),
        }));
      } else {
        dispatch(fetchPosts({
          limit: 10,
          ...(isRefresh ? {} : { lastVisible }),
        }));
      }
    },
    [dispatch, lastVisible, feedType]
  );

  const onRefresh = useCallback(() => {
    loadPosts(true);
  }, [loadPosts]);

  const loadMore = useCallback(() => {
    if (hasMore && lastVisible) {
      loadPosts();
    }
  }, [hasMore, lastVisible, loadPosts]);

  const handleLikePress = useCallback(
    (postId: string) => {
      // Optimistic update
      dispatch(toggleLikeOptimistic({ postId, userId: user?.uid || '' }));
      
      // Actual API call
      dispatch(likePostAsync(postId)).unwrap()
        .catch((error) => {
          console.error('Error liking post:', error);
          Alert.alert('Error', 'Failed to like post');
          // Revert optimistic update on failure
          dispatch(toggleLikeOptimistic({ postId, userId: user?.uid || '' }));
        });
    },
    [dispatch, user?.uid]
  );

  const handleCommentPress = useCallback((postId: string) => {
    console.log('Comment on post:', postId);
    // Implement comment functionality
  }, []);

  const handleDeletePress = useCallback((postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deletePost(postId))
              .unwrap()
              .then(() => {
                Alert.alert('Success', 'Post deleted successfully');
              })
              .catch((error) => {
                console.error('Error deleting post:', error);
                Alert.alert('Error', error.message || 'Failed to delete post');
              });
          },
        },
      ]
    );
  }, [dispatch]);

  const handleEditPress = useCallback((post: Post) => {
    setEditingPost(post);
    setIsEditModalVisible(true);
  }, []);

  const handleSavePost = useCallback(async (postId: string, content: string, imageUrl?: string) => {
    setIsSaving(true);
    try {
      await dispatch(updatePost({ postId, content, imageUrl })).unwrap();
      setIsEditModalVisible(false);
      setEditingPost(null);
      Alert.alert('Success', 'Post updated successfully');
    } catch (error: any) {
      console.error('Error updating post:', error);
      Alert.alert('Error', error.message || 'Failed to update post');
    } finally {
      setIsSaving(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostItem
        post={item}
        onLikePress={handleLikePress}
        onCommentPress={handleCommentPress}
        onDeletePress={handleDeletePress}
        onEditPress={handleEditPress}
        currentUserUid={user?.uid}
        showDeleteOption={item.userId === user?.uid}
      />
    ),
    [handleLikePress, handleCommentPress, handleDeletePress, handleEditPress, user?.uid]
  );

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loading]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptyText}>Be the first to share something with the community!</Text>
        </Card>
      </View>
    ),
    []
  );

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Button 
            title="Retry" 
            onPress={() => loadPosts(true)} 
            style={{ marginTop: theme.spacing.md }} 
          />
        </Card>
      </View>
    );
  }

  const TabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, feedType === 'all' && styles.activeTab]}
        onPress={() => setFeedType('all')}
      >
        <Text style={[styles.tabText, feedType === 'all' && styles.activeTabText]}>All Posts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, feedType === 'followed' && styles.activeTab]}
        onPress={() => setFeedType('followed')}
      >
        <Text style={[styles.tabText, feedType === 'followed' && styles.activeTabText]}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TabSelector />
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={11}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={posts.length === 0 ? styles.centerContent : null}
        getItemLayout={(data, index) => ({
          length: 300, // Approximate height of each item
          offset: 300 * index,
          index,
        })}
      />
      <EditPostModal
        visible={isEditModalVisible}
        post={editingPost}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleSavePost}
        saving={isSaving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    paddingVertical: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[500],
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
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
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  footerLoader: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
});

export default FeedScreen;
