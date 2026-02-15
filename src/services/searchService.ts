import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  orderBy,
  startAfter,
  Query,
} from 'firebase/firestore';
import { Post, Comment } from './postService';
import { UserProfile } from './userService';

export interface SearchResult {
  users: UserProfile[];
  posts: Post[];
}

export interface SearchOptions {
  limit?: number;
  lastVisible?: any;
}

class SearchService {
  private db = getFirestore();

  /**
   * Search users by name using a client-side filtering approach
   * Note: Firestore doesn't support full-text search, so we use alternative methods
   * This implementation fetches users and filters on the client side
   * For production apps, consider using Algolia, Elasticsearch, or Firestore with precomputed search arrays
   */
  async searchUsers(searchTerm: string, options: SearchOptions = {}): Promise<{ users: UserProfile[], lastVisible: any }> {
    try {
      // Clean the search term
      const cleanedTerm = searchTerm.trim().toLowerCase();
      if (!cleanedTerm) {
        return { users: [], lastVisible: null };
      }

      // Get users ordered by name
      let q: Query = query(
        collection(this.db, 'users'),
        orderBy('name'),
        limit(options.limit || 50)  // Get more than we need to have a good chance of matches
      );

      if (options.lastVisible) {
        q = query(q, startAfter(options.lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];

      for (const doc of querySnapshot.docs) {
        const userData = doc.data();
        // Client-side filter: check if the name contains the search term
        if (userData.name && userData.name.toLowerCase().includes(cleanedTerm)) {
          users.push({
            uid: doc.id,
            name: userData.name || '',
            bio: userData.bio || '',
            profileImage: userData.profileImage || null,
            createdAt: userData.createdAt || 0,
            updatedAt: userData.updatedAt || 0,
            followersCount: userData.followersCount || 0,
            followingCount: userData.followingCount || 0,
          } as UserProfile);
        }
      }

      // Since we filtered client-side, we might have fewer than the limit
      // Return only up to the requested limit
      const limitedUsers = users.slice(0, options.limit || 20);

      return {
        users: limitedUsers,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Search posts by content text using client-side filtering
   * Note: Firestore doesn't support full-text search, so we use alternative methods
   * This implementation fetches posts and filters on the client side
   * For production apps, consider using Algolia, Elasticsearch, or Firestore with precomputed search arrays
   */
  async searchPosts(searchTerm: string, options: SearchOptions = {}): Promise<{ posts: Post[], lastVisible: any }> {
    try {
      // Clean the search term
      const cleanedTerm = searchTerm.trim().toLowerCase();
      if (!cleanedTerm) {
        return { posts: [], lastVisible: null };
      }

      // Get posts ordered by timestamp (most recent first)
      let q: Query = query(
        collection(this.db, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(options.limit || 50)  // Get more than we need to have a good chance of matches
      );

      if (options.lastVisible) {
        q = query(q, startAfter(options.lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      for (const doc of querySnapshot.docs) {
        const postData = doc.data();
        // Client-side filter: check if the content contains the search term
        if (postData.content && postData.content.toLowerCase().includes(cleanedTerm)) {
          posts.push({
            id: doc.id,
            userId: postData.userId,
            username: postData.username,
            userAvatar: postData.userAvatar,
            content: postData.content,
            imageUrl: postData.imageUrl,
            likes: postData.likes || 0,
            comments: postData.comments || 0,
            timestamp: postData.timestamp,
            likedBy: postData.likedBy || [],
          } as Post);
        }
      }

      // Since we filtered client-side, we might have fewer than the limit
      // Return only up to the requested limit
      const limitedPosts = posts.slice(0, options.limit || 20);

      return {
        posts: limitedPosts,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      throw new Error('Failed to search posts');
    }
  }

  /**
   * Perform combined search for both users and posts
   */
  async searchAll(searchTerm: string, options: SearchOptions = {}): Promise<SearchResult> {
    try {
      const [usersResult, postsResult] = await Promise.all([
        this.searchUsers(searchTerm, options),
        this.searchPosts(searchTerm, options)
      ]);

      return {
        users: usersResult.users,
        posts: postsResult.posts
      };
    } catch (error) {
      console.error('Error in combined search:', error);
      throw new Error('Failed to perform search');
    }
  }
}

export default new SearchService();