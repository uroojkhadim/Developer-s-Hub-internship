import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  increment,
  writeBatch,
  query,
  where,
  limit,
  orderBy,
  startAfter,
} from 'firebase/firestore';
import { auth } from '../config/firebase';

export interface FollowData {
  userId: string;
  followerId: string;
  followedAt: number;
}

export interface FollowingData {
  userId: string;
  followedId: string;
  followedAt: number;
}

export interface FollowerInfo {
  id: string;
  name: string;
  profileImage: string | null;
  followedAt: number;
}

export interface FollowingInfo {
  id: string;
  name: string;
  profileImage: string | null;
  followedAt: number;
}

class FollowService {
  private db = getFirestore();

  /**
   * Follow a user
   */
  async followUser(targetUserId: string): Promise<boolean> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUserId = auth.currentUser.uid;
      
      // Prevent self-follow
      if (currentUserId === targetUserId) {
        throw new Error('Cannot follow yourself');
      }

      // Check if already following
      const followDoc = await getDoc(
        doc(this.db, `users/${currentUserId}/following`, targetUserId)
      );

      if (followDoc.exists()) {
        throw new Error('Already following this user');
      }

      // Use batch write for atomic operation
      const batch = writeBatch(this.db);

      // Create follow relationship in target user's followers
      const followRef = doc(this.db, `users/${targetUserId}/followers`, currentUserId);
      batch.set(followRef, {
        userId: targetUserId,
        followerId: currentUserId,
        followedAt: Date.now(),
      });

      // Create follow relationship in current user's following
      const followingRef = doc(this.db, `users/${currentUserId}/following`, targetUserId);
      batch.set(followingRef, {
        userId: currentUserId,
        followedId: targetUserId,
        followedAt: Date.now(),
      });

      // Increment follower count in target user's profile
      const targetUserRef = doc(this.db, 'users', targetUserId);
      batch.update(targetUserRef, { followersCount: increment(1) });

      // Increment following count in current user's profile
      const currentUserRef = doc(this.db, 'users', currentUserId);
      batch.update(currentUserRef, { followingCount: increment(1) });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(targetUserId: string): Promise<boolean> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUserId = auth.currentUser.uid;

      // Check if actually following
      const followDoc = await getDoc(
        doc(this.db, `users/${currentUserId}/following`, targetUserId)
      );

      if (!followDoc.exists()) {
        throw new Error('Not following this user');
      }

      // Use batch write for atomic operation
      const batch = writeBatch(this.db);

      // Remove follow relationship from target user's followers
      const followRef = doc(this.db, `users/${targetUserId}/followers`, currentUserId);
      batch.delete(followRef);

      // Remove follow relationship from current user's following
      const followingRef = doc(this.db, `users/${currentUserId}/following`, targetUserId);
      batch.delete(followingRef);

      // Decrement follower count in target user's profile
      const targetUserRef = doc(this.db, 'users', targetUserId);
      batch.update(targetUserRef, { followersCount: increment(-1) });

      // Decrement following count in current user's profile
      const currentUserRef = doc(this.db, 'users', currentUserId);
      batch.update(currentUserRef, { followingCount: increment(-1) });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  /**
   * Check if current user is following a target user
   */
  async checkFollowingStatus(targetUserId: string): Promise<boolean> {
    try {
      if (!auth.currentUser) {
        return false;
      }

      const currentUserId = auth.currentUser.uid;

      const followDoc = await getDoc(
        doc(this.db, `users/${currentUserId}/following`, targetUserId)
      );

      return followDoc.exists();
    } catch (error) {
      console.error('Error checking following status:', error);
      return false;
    }
  }

  /**
   * Get followers of a user
   */
  async getFollowers(userId: string, limitCount: number = 20, lastVisible: any = null) {
    try {
      let q = query(
        collection(this.db, `users/${userId}/followers`),
        orderBy('followedAt', 'desc'),
        limit(limitCount)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      
      // Extract follower IDs from the documents
      const followerIds = snapshot.docs.map(doc => doc.id);
      
      // Fetch user profiles for these followers
      const followers: FollowerInfo[] = [];
      for (const followerId of followerIds) {
        const userDoc = await getDoc(doc(this.db, 'users', followerId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          followers.push({
            id: followerId,
            name: userData.name,
            profileImage: userData.profileImage,
            followedAt: snapshot.docChanges().find(d => d.doc.id === followerId)?.doc.data()?.followedAt || Date.now(),
          });
        }
      }

      return {
        followers,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string, limitCount: number = 20, lastVisible: any = null) {
    try {
      let q = query(
        collection(this.db, `users/${userId}/following`),
        orderBy('followedAt', 'desc'),
        limit(limitCount)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      
      // Extract followed IDs from the documents
      const followedIds = snapshot.docs.map(doc => doc.id);
      
      // Fetch user profiles for these followed users
      const following: FollowingInfo[] = [];
      for (const followedId of followedIds) {
        const userDoc = await getDoc(doc(this.db, 'users', followedId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          following.push({
            id: followedId,
            name: userData.name,
            profileImage: userData.profileImage,
            followedAt: snapshot.docChanges().find(d => d.doc.id === followedId)?.doc.data()?.followedAt || Date.now(),
          });
        }
      }

      return {
        following,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  }

  /**
   * Get posts from followed users only
   */
  async getPostsFromFollowedUsers(limitCount: number = 10, lastVisible: any = null) {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUserId = auth.currentUser.uid;

      // First get the list of users that the current user is following
      const followingResult = await this.getFollowing(currentUserId);
      const followedUserIds = followingResult.following.map(user => user.id);

      if (followedUserIds.length === 0) {
        // Return empty array if no one is being followed
        return { posts: [], lastVisible: null };
      }

      // Now get posts from these followed users
      // Note: This is a simplified approach. For better performance in production,
      // consider implementing a timeline collection where posts are aggregated
      let q = query(
        collection(this.db, 'posts'),
        where('userId', 'in', followedUserIds),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        posts,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error('Error getting posts from followed users:', error);
      throw error;
    }
  }
}

export default new FollowService();