import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

import { Button, Card } from '../../components';
import postService from '../../services/postService';
import theme from '../../theme';
import type { RootState } from '../../store';

interface ImagePickerResponse {
  assets?: Array<{
    uri: string;
    type: string;
    fileName: string;
  }>;
}

const CreatePostScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectImage = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => openImageLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = () => {
    const options: any = {
      mediaType: 'photo' as const,
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchCamera(options, response => {
      if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setSelectedImage(imageUri);
        }
      }
    });
  };

  const openImageLibrary = () => {
    const options: any = {
      mediaType: 'photo' as const,
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, response => {
      if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setSelectedImage(imageUri);
        }
      }
    });
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (selectedImage) {
        imageUrl = await postService.uploadPostImage(selectedImage);
      }

      // Create post
      await postService.createPost({
        content: content.trim(),
        imageUrl,
      });

      // Reset form
      setContent('');
      setSelectedImage(null);

      Alert.alert('Success', 'Post created successfully!');
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const canPost = content.trim().length > 0 || selectedImage !== null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          {/* User Info Header */}
          <View style={styles.header}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.username}>{user?.displayName || 'User'}</Text>
              <View style={styles.audienceSelector}>
                <Icon name="earth-outline" size={14} color={theme.colors.gray[600]} />
                <Text style={styles.audienceText}>Public</Text>
                <Icon name="chevron-down" size={12} color={theme.colors.gray[600]} />
              </View>
            </View>
          </View>

          {/* Post Content Input */}
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.colors.gray[500]}
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{content.length}/500</Text>

          {/* Selected Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Icon name="close" size={16} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={selectImage}>
              <Icon name="image-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionText}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="location-outline" size={20} color={theme.colors.success} />
              <Text style={styles.actionText}>Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="happy-outline" size={20} color={theme.colors.warning} />
              <Text style={styles.actionText}>Feeling</Text>
            </TouchableOpacity>
          </View>

          {/* Post Button */}
          <Button
            title="Post"
            onPress={handleCreatePost}
            loading={loading}
            disabled={!canPost || loading}
            style={styles.postButton}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
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
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.white,
  },
  username: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.dark,
  },
  audienceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  audienceText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[600],
    marginHorizontal: theme.spacing.xs,
  },
  textInput: {
    minHeight: 120,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.xs,
  },
  characterCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    textAlign: 'right',
    marginBottom: theme.spacing.md,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[700],
    marginTop: theme.spacing.xs,
  },
  postButton: {
    marginTop: theme.spacing.sm,
  },
});

export default CreatePostScreen;
