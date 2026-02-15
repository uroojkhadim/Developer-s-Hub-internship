# Firebase Cloud Messaging (FCM) Notifications Implementation Guide

## 🎯 Overview

This document explains how Firebase Cloud Messaging works in your React Native app and details the backend trigger logic for notifications.

## 🔥 How Firebase Cloud Messaging Works

### Core Architecture

**1. Client-Side Flow**
```
Device → Request FCM Token → Send to Server → Store in User Profile
   ↑                                              ↓
   ←←←←←←← Receive Push Notifications ←←←←←←←←←←←←
```

**2. Message Types**

**Foreground Messages**: Handled by the app when it's open
**Background Messages**: Delivered to system tray when app is closed

**3. Token Management**
- Each device gets a unique FCM registration token
- Tokens can expire or change (app reinstall, OS updates)
- Tokens are stored in user documents for targeted delivery

### Implementation Details

**Token Registration:**
```typescript
// Get FCM token for current user
const token = await getToken(messaging, {
  vapidKey: 'YOUR_PUBLIC_VAPID_KEY'
});

// Store in user profile
await updateDoc(doc(db, 'users', userId), {
  fcmToken: token,
  fcmTokenUpdatedAt: Timestamp.now()
});
```

**Message Handling:**
```typescript
// Foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received in foreground:', payload);
  // Display in-app notification
});

// Background messages (requires service worker in web)
// Handled automatically by the system
```

## ⚙️ Backend Trigger Logic

### Notification Triggers

**1. Like Notifications**
Triggered when: User likes a post they don't own
Logic:
```
User A likes Post by User B
→ Check if User A ≠ User B
→ Create notification in Firestore
→ Send push notification to User B's device
```

**2. Comment Notifications**
Triggered when: User comments on a post they don't own
Logic:
```
User A comments on Post by User B
→ Check if User A ≠ User B
→ Create notification in Firestore
→ Send push notification to User B's device
```

### Implementation Flow

**Like Trigger Flow:**
```typescript
// In postService.likePost()
1. User clicks like button
2. Update post likes count in Firestore
3. IF post owner ≠ current user:
   a. Get current user profile
   b. Create notification document
   c. Send push notification via FCM
4. Return success/failure
```

**Comment Trigger Flow:**
```typescript
// In postService.addComment()
1. User submits comment
2. Add comment to Firestore
3. Update post comment count
4. IF post owner ≠ current user:
   a. Get current user profile
   b. Create notification document
   c. Send push notification via FCM
5. Return comment data
```

## 📱 Client-Side Implementation

### Notification Service Architecture

```typescript
class NotificationService {
  // Token Management
  - requestNotificationPermission()
  - getFCMToken()
  - storeTokenInUserProfile()
  
  // Notification Creation
  - createNotification()
  - sendPushNotification()
  
  // Data Operations
  - getNotifications()
  - markAsRead()
  - deleteNotification()
  
  // Real-time Listeners
  - subscribeToNotifications()
  - subscribeToUnreadCount()
}
```

### Custom Hooks

```typescript
// useNotifications - Main notification hook
const { 
  notifications,     // Array of notifications
  loading,          // Loading state
  error,            // Error state
  markAsRead,       // Mark single notification as read
  markAllAsRead,    // Mark all as read
  deleteNotification // Delete notification
} = useNotifications();

// useUnreadCount - Unread counter hook
const { 
  unreadCount,      // Number of unread notifications
  loading,         // Loading state
  error            // Error state
} = useUnreadCount();
```

## 🛠️ Integration Points

### 1. Post Service Integration

**Modified Methods:**
- `likePost()` - Now creates like notifications
- `addComment()` - Now creates comment notifications

**Added Dependencies:**
```typescript
import { createLikeNotification, createCommentNotification } from '../hooks/useNotifications';
```

### 2. Real-time Updates

**Notification Listener:**
```typescript
useEffect(() => {
  const unsubscribe = notificationService.subscribeToNotifications(
    (notifications) => {
      setNotifications(notifications);
      setLoading(false);
    },
    (error) => {
      setError(error.message);
      setLoading(false);
    }
  );
  
  return () => unsubscribe();
}, []);
```

### 3. UI Components

**Notification Screen Features:**
- Real-time notification feed
- Unread indicators
- Mark as read functionality
- Delete notifications
- Badge with unread count
- Pull-to-refresh

## 🔧 Configuration Requirements

### Firebase Setup

**1. Enable Cloud Messaging:**
- Go to Firebase Console
- Select your project
- Navigate to Cloud Messaging
- Copy Sender ID and Server Key

**2. Update Firebase Config:**
```typescript
// src/config/firebase.ts
const firebaseConfig = {
  // ... existing config
  messagingSenderId: 'YOUR_SENDER_ID',
  // For web: add VAPID key
  // vapidKey: 'YOUR_VAPID_KEY'
};
```

**3. Android Configuration:**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Add FCM service -->
<service
  android:name=".java.MyFirebaseMessagingService"
  android:exported="false">
  <intent-filter>
    <action android:name="com.google.firebase.MESSAGING_EVENT" />
  </intent-filter>
</service>
```

**4. iOS Configuration:**
- Enable Push Notifications capability
- Configure APNs certificates
- Add Background Modes capability

## 📊 Data Structure

### Notifications Collection
```
/notifications/{notificationId}
├── recipientId: string        // User receiving notification
├── senderId: string          // User triggering notification
├── senderName: string        // Display name
├── senderAvatar: string      // Avatar URL
├── type: string             // 'like' | 'comment' | 'reply' | etc.
├── title: string            // Notification title
├── body: string             // Notification body
├── postId: string           // Related post (optional)
├── commentId: string        // Related comment (optional)
├── read: boolean            // Read status
├── createdAt: timestamp     // Creation time
└── updatedAt: timestamp     // Last update time
```

### User Profile Enhancement
```
/users/{userId}
├── // existing fields
├── fcmToken: string         // Device FCM token
└── fcmTokenUpdatedAt: timestamp // Token last update
```

## 🔒 Security Considerations

### Firestore Rules
```javascript
// Allow users to read their own notifications
match /notifications/{notificationId} {
  allow read, write: if request.auth != null && 
                     request.auth.uid == resource.data.recipientId;
}

// Allow creating notifications (server-side)
match /notifications/{notificationId} {
  allow create: if request.auth != null;
}
```

### Token Security
- Never expose FCM server key in client code
- Validate notification recipients server-side
- Implement rate limiting for notification creation
- Sanitize notification content

## 🚀 Performance Optimization

### 1. Pagination
```typescript
// Limit notifications fetched
const { notifications, lastVisible } = await getNotifications({
  limit: 20,
  lastVisible: previousLastVisible
});
```

### 2. Efficient Updates
```typescript
// Batch mark as read operations
await markAllAsRead(); // Single batch operation
```

### 3. Smart Listening
```typescript
// Only listen when component is active
useEffect(() => {
  if (isActive) {
    const unsubscribe = subscribeToNotifications(callback);
    return unsubscribe;
  }
}, [isActive]);
```

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// Test notification creation
it('creates like notification correctly', async () => {
  await createLikeNotification(...);
  // Verify Firestore document created
});

// Test trigger logic
it('triggers notification on like', async () => {
  await likePost(postId);
  // Verify notification was created
});
```

### 2. Integration Tests
```typescript
// Test end-to-end flow
it('shows notification when post is liked', async () => {
  // Like a post
  // Wait for notification
  // Verify UI updates
});
```

### 3. Manual Testing
1. Like your own post (should NOT create notification)
2. Like someone else's post (should create notification)
3. Comment on posts (should create notifications)
4. Check notification screen updates in real-time
5. Test mark as read functionality
6. Verify push notifications arrive

## 🎯 Future Enhancements

### 1. Advanced Features
- Notification grouping
- Rich media notifications
- Scheduled notifications
- Localization support
- Deep linking to content

### 2. Analytics
- Notification open rates
- User engagement metrics
- Delivery success rates
- A/B testing different notification content

### 3. Performance Improvements
- Notification caching
- Background sync
- Offline notification queuing
- Smart batching

This implementation provides a production-ready notification system with real-time updates, proper error handling, and scalable architecture.