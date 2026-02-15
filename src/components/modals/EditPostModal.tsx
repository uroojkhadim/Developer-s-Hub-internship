import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import theme from '../../theme';
import type { Post } from '../../services/postService';

interface EditPostModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onSave: (postId: string, content: string, imageUrl?: string) => Promise<void>;
  saving: boolean;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  post,
  onClose,
  onSave,
  saving,
}) => {
  const [editedContent, setEditedContent] = useState(post?.content || '');
  const [editedImageUrl, setEditedImageUrl] = useState(post?.imageUrl || '');

  const handleSave = async () => {
    if (!post) {
      Alert.alert('Error', 'Post not found');
      return;
    }

    if (!editedContent.trim()) {
      Alert.alert('Error', 'Post content cannot be empty');
      return;
    }

    try {
      await onSave(post.id, editedContent, editedImageUrl);
      setEditedContent('');
      setEditedImageUrl('');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update post');
    }
  };

  const handleClose = () => {
    setEditedContent(post?.content || '');
    setEditedImageUrl(post?.imageUrl || '');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Post</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TextInput
              style={styles.input}
              value={editedContent}
              onChangeText={setEditedContent}
              placeholder="What's on your mind?"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            {post?.imageUrl && (
              <TextInput
                style={styles.input}
                value={editedImageUrl}
                onChangeText={setEditedImageUrl}
                placeholder="Image URL (optional)"
                keyboardType="url"
              />
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.disabledButton]} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    width: '90%',
    maxWidth: 500,
    borderRadius: 8,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  title: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: '600',
    color: theme.colors.dark,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 4,
    padding: theme.spacing.md,
    minHeight: 120,
    fontSize: theme.typography.body1.fontSize,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[400],
    borderRadius: 4,
  },
  cancelButtonText: {
    color: theme.colors.dark,
    fontSize: theme.typography.body1.fontSize,
  },
  saveButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default EditPostModal;