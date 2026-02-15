import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  // ActivityIndicator, // Reserved for future use
} from 'react-native';
import { useSelector /* , useDispatch */ } from 'react-redux';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

import { Input, Button, Card } from '../../components';
import userService from '../../services/userService';
import theme from '../../theme';
import type { RootState /* , AppDispatch */ } from '../../store';
// import type { User } from 'firebase/auth'; // Reserved for future use

// interface ImagePickerResponse { // Reserved for future use
//   assets?: Array<{
//     uri: string;
//     type: string;
//     fileName: string;
//   }>;
// }

const ProfileSetupScreen: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>(); // Reserved for future use
  const { user } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(user?.photoURL || null);
  const [loading, setLoading] = useState(false);
  // const [uploading, setUploading] = useState(false); // Reserved for future use

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setProfileImage(user.photoURL || null);
    }
  }, [user]);

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
          setProfileImage(imageUri);
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
          setProfileImage(imageUri);
        }
      }
    });
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await userService.updateUserProfile({
        uid: user?.uid || '',
        name: name.trim(),
        bio: bio.trim(),
        profileImage,
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const removeProfileImage = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setProfileImage(null),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.imageContainer}>
            {profileImage ? (
              <>
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeProfileImage}>
                  <Icon name="close" size={16} color={theme.colors.white} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyImagePlaceholder}>
                <Icon name="person-outline" size={40} color={theme.colors.gray[400]} />
              </View>
            )}
          </View>

          <Button
            title={profileImage ? 'Change Photo' : 'Add Photo'}
            variant="outline"
            onPress={selectImage}
            style={styles.imageButton}
            // loading={uploading} // Reserved for future use
          />
        </View>

        {/* Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Name</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
        </View>

        {/* Bio Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Bio</Text>
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
            style={styles.bioInput}
          />
          <Text style={styles.characterCount}>{bio.length}/150</Text>
        </View>

        {/* Save Button */}
        <Button
          title="Save Profile"
          onPress={handleSaveProfile}
          loading={loading}
          style={styles.saveButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  card: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.dark,
    marginBottom: theme.spacing.lg,
    alignSelf: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  emptyImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: theme.colors.danger,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  imageButton: {
    width: '60%',
  },
  fieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '500' as const,
    color: theme.colors.dark,
    marginBottom: theme.spacing.sm,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
  },
});

export default ProfileSetupScreen;
