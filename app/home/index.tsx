import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import CreatePost from '../../components/CreatePost';
import Post from '../../components/Post';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostContext';

const HomeScreen = () => {
  const { posts, loading, likePost, refreshPosts } = usePosts();
  const { user } = useAuth();

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      await likePost(postId, user.id);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to comments screen
    // navigation.navigate('Comments', { postId });
    console.log('Navigate to comments for post:', postId);
  };

  const handlePostCreated = () => {
    refreshPosts();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.createPostContainer}>
            <CreatePost onPostCreated={handlePostCreated} />
          </View>
        }
        renderItem={({ item }) => (
          <Post
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            currentUserId={user?.id || ''}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshPosts} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet. Be the first to post!</Text>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  createPostContainer: {
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
