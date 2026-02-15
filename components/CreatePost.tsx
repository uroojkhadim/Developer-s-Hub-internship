import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCrossPostEnabled, setIsCrossPostEnabled] = useState(true);
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
      <View style={styles.card}>
        {/* Image preview / picker */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.mediaContainer}
          onPress={pickImage}
          disabled={isSubmitting}
        >
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.mediaEditButton} onPress={pickImage}>
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaCloseButton} onPress={removeImage}>
                <MaterialIcons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.mediaPlaceholder}>
              <View style={styles.mediaIconCircle}>
                <MaterialIcons name="image" size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.mediaTitle}>Add photo or video</Text>
              <Text style={styles.mediaSubtitle}>Tap to choose from your gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption input */}
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={content}
            onChangeText={setContent}
            editable={!isSubmitting}
          />
        </View>

        {/* Options list */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7}>
            <View style={styles.optionIconWrapper}>
              <MaterialIcons name="person-add-alt" size={22} color="#0EA5E9" />
            </View>
            <Text style={styles.optionLabel}>Tag People</Text>
            <MaterialIcons name="chevron-right" size={22} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7}>
            <View style={styles.optionIconWrapper}>
              <MaterialIcons name="location-on" size={22} color="#0EA5E9" />
            </View>
            <Text style={styles.optionLabel}>Add Location</Text>
            <MaterialIcons name="chevron-right" size={22} color="#D1D5DB" />
          </TouchableOpacity>

          <View style={styles.optionRow}>
            <View style={styles.optionIconWrapper}>
              <MaterialIcons name="share" size={22} color="#0EA5E9" />
            </View>
            <View style={styles.optionTextGroup}>
              <Text style={styles.optionLabel}>Post to Facebook</Text>
              <Text style={styles.optionSubLabel}>Connected as @social_user</Text>
            </View>
            <Switch
              value={isCrossPostEnabled}
              onValueChange={setIsCrossPostEnabled}
              trackColor={{ false: '#E5E7EB', true: '#BAE6FD' }}
              thumbColor={isCrossPostEnabled ? '#0EA5E9' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Nearby suggestions */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Nearby suggestions</Text>
          <View style={styles.chipsRow}>
            {['San Francisco, CA', 'Golden Gate Bridge', 'Silicon Valley'].map(chip => (
              <TouchableOpacity key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer post button */}
        <View style={styles.footer}>
          <View />
          <TouchableOpacity
            style={[styles.postButton, (!content.trim() && !imageUri) && styles.postButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !imageUri)}
          >
            <Text style={styles.postButtonText}>
              {isSubmitting ? 'Posting...' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F5FA',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  mediaContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 260,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mediaSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  mediaEditButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(15, 118, 190, 0.95)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaCloseButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  captionInput: {
    minHeight: 80,
    fontSize: 15,
    color: '#111827',
    textAlignVertical: 'top',
  },
  optionsContainer: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  optionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextGroup: {
    flex: 1,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  optionSubLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  postButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  postButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default CreatePost;
