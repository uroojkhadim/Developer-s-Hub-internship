import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { Post as PostType } from '../types/post';
import Post from './Post';
import CreatePost from './CreatePost';
import { likePost, updatePost as updatePostService, deletePost as deletePostService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';

const PostList = () => {
  const { user } = useAuth();
  const { posts, loading, refreshPosts } = usePosts();

  const stories = [
    { id: 'me', label: 'Your Story', isOwn: true },
    { id: 'sarah', label: 'Sarah' },
    { id: 'alex', label: 'Alex' },
    { id: 'jordan', label: 'Jordan' },
    { id: 'ella', label: 'Ella' },
  ];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImageUri, setEditImageUri] = useState<string | null>(null);

  const handlePostCreated = async () => {
    await refreshPosts();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPosts();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      await likePost(postId, user.id);
      await refreshPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to comments screen
    // navigation.navigate('Comments', { postId });
  };

  const startEdit = (post: PostType) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditImageUri(post.imageUrl || null);
  };

  const pickEditImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media permissions are required to update images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setEditImageUri(result.assets[0].uri);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    try {
      await updatePostService(editingPost.id, { content: editContent, imageUrl: editImageUri || '' });
      setEditingPost(null);
      await refreshPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Could not update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePostService(postId);
            await refreshPosts();
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Could not delete post');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View>
            {/* Stories row */}
            <View style={styles.storiesRow}>
              {stories.map(story => (
                <View key={story.id} style={styles.storyItem}>
                  <View style={[styles.storyBubble, story.isOwn && styles.storyBubbleOwn]}>
                    {story.isOwn && <View style={styles.storyPlus} />}
                  </View>
                  <Text style={styles.storyLabel} numberOfLines={1}>
                    {story.label}
                  </Text>
                </View>
              ))}
            </View>
            <CreatePost onPostCreated={handlePostCreated} />
          </View>
        }
        renderItem={({ item }) => (
          <Post 
            post={item} 
            onLike={handleLike} 
            onComment={handleComment} 
            onEdit={startEdit}
            onDelete={handleDeletePost}
            currentUserId={user?.id || ''} 
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || loading}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading posts...' : 'No posts yet. Be the first to post!'}
            </Text>
            {!loading && posts.length === 0 && (
              <Text style={styles.emptySubtext}>
                Pull down to refresh or create a new post above
              </Text>
            )}
          </View>
        }
      />

      <Modal visible={!!editingPost} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            <TextInput
              style={styles.modalInput}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              placeholder="Update your post"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={pickEditImage}>
                <Text style={styles.modalButtonText}>Update Media</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={handleUpdatePost}>
                <Text style={[styles.modalButtonText, styles.primaryButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setEditingPost(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5FA',
  },
  storiesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  storyBubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#0EA5E9',
    backgroundColor: '#FFE4D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyBubbleOwn: {
    backgroundColor: '#FFE4D6',
  },
  storyPlus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
  },
  storyLabel: {
    marginTop: 6,
    fontSize: 11,
    color: '#6B7280',
  },
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#1a73e8',
  },
  modalButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  modalClose: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  modalCloseText: {
    color: '#1a73e8',
    fontWeight: '600',
  },
});

export default PostList;
