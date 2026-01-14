import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const { createPost } = usePosts();

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'An error occurred while selecting the image');
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageUri) {
      Alert.alert('Error', 'Please add some text or an image to your post');
      return;
    }

    try {
      setIsSubmitting(true);
      await createPost(content, imageUri || undefined);
      setContent('');
      setImageUri(null);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          multiline
          value={content}
          onChangeText={setContent}
          editable={!isSubmitting}
        />
        
        {imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={pickImage}
            disabled={isSubmitting}
          >
            <MaterialIcons name="image" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.postButton, (!content.trim() && !imageUri) && styles.postButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !imageUri)}
          >
            <Text style={styles.postButtonText}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 15,
  },
  inputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 10,
  },
  input: {
    fontSize: 16,
    maxHeight: 150,
    padding: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  iconButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CreatePost;
