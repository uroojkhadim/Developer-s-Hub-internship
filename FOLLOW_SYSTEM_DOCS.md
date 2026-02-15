# Follow/Unfollow System - Technical Documentation

## Firestore Database Structure

### Users Collection (Enhanced)

```
/users/{userId}
```

**Extended Document Structure:**
```javascript
{
  uid: string,              // Firebase Auth UID
  name: string,             // User's full name
  bio: string,              // User biography (max 150 chars)
  profileImage: string,     // Firebase Storage URL or null
  createdAt: number,        // Timestamp when profile was created
  updatedAt: number,        // Timestamp when profile was last updated
  email: string,            // User's email (from Firebase Auth)
  followersCount: number,   // Total number of followers (default: 0)
  followingCount: number    // Total number of accounts being followed (default: 0)
}
```

### Followers Subcollection

```
/users/{userId}/followers/{followerUserId}
```

**Document Structure:**
```javascript
{
  userId: string,           // ID of the user being followed
  followerId: string,       // ID of the user who is following
  followedAt: number        // Timestamp when the follow occurred
}
```

### Following Subcollection

```
/users/{userId}/following/{followedUserId}
```

**Document Structure:**
```javascript
{
  userId: string,           // ID of the user who is following
  followedId: string,       // ID of the user being followed
  followedAt: number        // Timestamp when the follow occurred
}
```

## Implementation Details

### 1. Follow Operation
When user A follows user B:
1. Create document in `/users/B/followers/A` with follow data
2. Create document in `/users/A/following/B` with follow data
3. Increment `followersCount` in `/users/B` document
4. Increment `followingCount` in `/users/A` document

### 2. Unfollow Operation
When user A unfollows user B:
1. Delete document from `/users/B/followers/A`
2. Delete document from `/users/A/following/B`
3. Decrement `followersCount` in `/users/B` document
4. Decrement `followingCount` in `/users/A` document

### 3. Query Operations

**Get user's followers:**
```javascript
const followers = await getDocs(
  collection(db, 'users', userId, 'followers')
);
```

**Get user's following:**
```javascript
const following = await getDocs(
  collection(db, 'users', userId, 'following')
);
```

**Check if user A follows user B:**
```javascript
const follows = await getDoc(
  doc(db, 'users', userIdA, 'following', userIdB)
);
```

**Get posts from followed users only:**
```javascript
// This would require a separate implementation to filter posts
// based on the following list
```

## Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Followers subcollection
    match /users/{userId}/followers/{followerId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == followerId;
      allow delete: if request.auth != null && request.auth.uid == request.auth.uid;
    }
    
    // Following subcollection
    match /users/{userId}/following/{followedId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == request.auth.uid;
    }
  }
}
```

## Service Implementation

### FollowService Methods
- `followUser(userId: string, targetUserId: string)`: Follow a user
- `unfollowUser(userId: string, targetUserId: string)`: Unfollow a user
- `checkFollowingStatus(userId: string, targetUserId: string)`: Check if user A follows user B
- `getFollowers(userId: string)`: Get list of followers
- `getFollowing(userId: string)`: Get list of followed users

## Performance Considerations

### 1. Count Updates
- Use atomic increment/decrement operations for count updates
- Consider using Cloud Functions for complex count updates

### 2. Following Posts Feed
- For optimal performance, implement a separate "timeline" collection
- Maintain a timeline document per user with recent posts from followed users
- Update timeline when user creates posts or follows/unfollows others

### 3. Pagination
- Implement pagination for followers/following lists
- Limit query results to prevent large downloads

## Error Handling

### Common Error Scenarios:
1. **Already Following**: Attempting to follow a user already followed
2. **Not Following**: Attempting to unfollow a user not being followed
3. **Self-Follow**: Attempting to follow oneself
4. **Network Issues**: Retry mechanism with exponential backoff
5. **Permission Denied**: Clear user-facing error messages

### Error Recovery:
- Transaction rollback on partial failure
- Local state preservation during failures
- Option to retry failed operations
- Detailed logging for debugging

## Scalability Considerations

### Current Implementation:
- Handles up to thousands of follows/followers efficiently
- Uses Firestore subcollections for better organization
- Atomic operations for data consistency

### Future Enhancements:
- Cloud Functions for complex follow operations
- Timeline aggregation for efficient feed loading
- Caching strategies for frequently accessed follow data
- Analytics integration for user engagement metrics