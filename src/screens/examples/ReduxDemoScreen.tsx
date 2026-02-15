import React, { useCallback, useEffect } from 'react';
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
import { Card, Button } from '../../components';
import {
  fetchPosts,
  likePostAsync,
  createPost,
  toggleLikeOptimistic,
} from '../../store/slices/postsSlice';
import { selectFeedData, selectUserData } from '../../store/helpers/selectors';
import theme from '../../theme';
import type { Post } from '../../services/postService';

const ReduxDemoScreen: React.FC = () => {
  const dispatch = useDispatch();

  // Select data from Redux store
  const { user } = useSelector(selectUserData);
  const { posts, loading, refreshing, hasMore, error } = useSelector(selectFeedData);

  // Fetch posts on component mount
  useEffect(() => {
    dispatch(fetchPosts({ limit: 10 }));
  }, [dispatch]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    dispatch(fetchPosts({ limit: 10 }));
  }, [dispatch]);

  // Handle like with optimistic update
  const handleLikePress = useCallback(
    async (postId: string) => {
      // Optimistic update - update UI immediately
      dispatch(toggleLikeOptimistic(postId));

      try {
        // Then update backend
        await dispatch(likePostAsync(postId)).unwrap();
      } catch (error) {
        // Rollback on failure
        dispatch(toggleLikeOptimistic(postId));
        Alert.alert('Error', 'Failed to like post');
      }
    },
    [dispatch]
  );

  // Handle create post
  const handleCreatePost = useCallback(async () => {
    try {
      await dispatch(
        createPost({
          content: 'New post from Redux demo!',
        })
      ).unwrap();
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  }, [dispatch]);

  // Handle comment press
  const handleCommentPress = useCallback((postId: string) => {
    console.log('Comment on post:', postId);
    // Implement comment functionality
  }, []);

  // Handle delete press
  const handleDeletePress = useCallback((postId: string) => {
    console.log('Delete post:', postId);
    // Implement delete functionality
  }, []);

  // Render post item
  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostItem
        post={item}
        onLikePress={handleLikePress}
        onCommentPress={handleCommentPress}
        onDeletePress={handleDeletePress}
        currentUserUid={user?.uid}
        showDeleteOption={true}
      />
    ),
    [handleLikePress, handleCommentPress, handleDeletePress, user?.uid]
  );

  // Render loading state
  if (loading && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with action buttons */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Redux Demo Feed</Text>
        <View style={styles.headerActions}>
          <Button title="Create Post" onPress={handleCreatePost} style={styles.createButton} />
          <Button title="Refresh" variant="outline" onPress={onRefresh} loading={refreshing} />
        </View>
      </View>

      {/* Posts list */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Posts</Text>
              <Text style={styles.emptyText}>
                {error ? error : 'No posts available. Create one to get started!'}
              </Text>
            </Card>
          </View>
        }
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
  centerContainer: {
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
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
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
});

export default ReduxDemoScreen;
