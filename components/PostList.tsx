import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Post as PostType } from '../types/post';
import Post from './Post';
import CreatePost from './CreatePost';
import { getPosts, likePost, updatePost as updatePostService, deletePost as deletePostService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';

const PostList = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { refreshPosts } = usePosts();
  const [editingPost, setEditingPost] = useState<PostType | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImageUri, setEditImageUri] = useState<string | null>(null);

  const handlePostCreated = () => {
    loadPosts(true);
  };

  const loadPosts = useCallback(async (refresh = false) => {
    if ((isLoading || isRefreshing) && !refresh) return;
    
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isLoading, isRefreshing]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      await likePost(postId, user.id);
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const isLiked = post.likes.includes(user.id);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== user.id)
                : [...post.likes, user.id]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
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
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Could not delete post');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={<CreatePost onPostCreated={handlePostCreated} />}
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
            refreshing={isRefreshing}
            onRefresh={() => loadPosts(true)}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReached={() => !isLoading && loadPosts()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet. Be the first to post!</Text>
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
    backgroundColor: '#f5f5f5',
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
