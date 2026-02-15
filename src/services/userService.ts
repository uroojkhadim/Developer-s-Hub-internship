import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../config/firebase';

interface UserProfile {
  uid: string;
  name: string;
  bio: string;
  profileImage: string | null;
  createdAt: number;
  updatedAt: number;
  followersCount: number;
  followingCount: number;
}

interface UpdateProfileData {
  uid: string;
  name: string;
  bio: string;
  profileImage: string | null;
}

class UserService {
  private db = getFirestore();
  private storage = getStorage();

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  async updateUserProfile(data: UpdateProfileData): Promise<void> {
    try {
      let imageUrl = data.profileImage;

      // Upload image to Firebase Storage if it's a local URI
      if (data.profileImage && data.profileImage.startsWith('file://')) {
        imageUrl = await this.uploadProfileImage(data.uid, data.profileImage);
      }

      const profileData: UserProfile = {
        uid: data.uid,
        name: data.name,
        bio: data.bio,
        profileImage: imageUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        followersCount: 0,
        followingCount: 0,
      };

      // Update user's display name in Firebase Auth
      if (auth.currentUser) {
        // Type assertion to access updateProfile method
        const user = auth.currentUser;
        if ('updateProfile' in user) {
          await (user as any).updateProfile({
            displayName: data.name,
            photoURL: imageUrl || undefined,
          });
        }
      }

      // Save profile to Firestore
      await setDoc(doc(this.db, 'users', data.uid), profileData, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  private async uploadProfileImage(uid: string, imageUri: string): Promise<string> {
    try {
      // Convert file URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create storage reference
      const storageRef = ref(this.storage, `profile_images/${uid}_${Date.now()}`);

      // Upload image
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error('Failed to upload profile image');
    }
  }

  async deleteUserProfile(uid: string): Promise<void> {
    try {
      // In a real app, you might want to implement soft delete or archive
      // For now, we'll just demonstrate the structure
      console.log(`Deleting profile for user: ${uid}`);
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw new Error('Failed to delete profile');
    }
  }
}

export default new UserService();
export type { UserProfile, UpdateProfileData };
