# Chat System - Technical Documentation

## Overview
This document explains the architecture and implementation of the one-to-one chat system using Firebase Firestore for the React Native social media app.

## Firestore Data Structure

### Chats Collection
```
/chats/{chatId}
```

**Document Structure:**
```javascript
{
  id: string,                    // Unique chat ID (typically combination of user IDs)
  participants: string[],        // Array of user IDs involved in the chat (2 for one-to-one)
  createdAt: number,             // Timestamp when chat was created
  updatedAt: number,             // Timestamp of last activity
  lastMessage: {
    text: string,                // Content of last message
    senderId: string,            // ID of user who sent the message
    timestamp: number,           // When the message was sent
    type: string                 // 'text', 'image', etc.
  },
  unreadCounts: {                // Number of unread messages for each participant
    [userId: string]: number
  }
}
```

### Messages Subcollection
```
/chats/{chatId}/messages/{messageId}
```

**Document Structure:**
```javascript
{
  id: string,                    // Unique message ID
  text: string,                  // Message content
  senderId: string,              // ID of the user who sent the message
  receiverId: string,            // ID of the user who received the message
  timestamp: number,             // When the message was sent
  read: boolean,                 // Whether the message has been read
  type: string,                  // 'text', 'image', 'video', etc.
  status: string                 // 'sent', 'delivered', 'read'
}
```

## Implementation Details

### 1. Creating a Chat
When two users initiate a chat:
1. Generate a unique chat ID (sorted combination of user IDs to ensure uniqueness)
2. Create a chat document in `/chats/{chatId}`
3. Add both users to the participants array
4. Initialize unreadCounts for both users

### 2. Sending a Message
When a user sends a message:
1. Add message to `/chats/{chatId}/messages/{messageId}`
2. Update the lastMessage field in the chat document
3. Update the chat's updatedAt timestamp
4. Set message status to 'sent'

### 3. Marking Messages as Read
When a user opens a chat:
1. Update unreadCounts in the chat document for that user
2. Update read status for messages in the messages subcollection

### 4. Chat List Queries
To get a user's chat list:
1. Query chats where the user is a participant
2. Order by updatedAt to show most recent conversations first
3. Limit to recent chats for performance

## Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chats collection
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid in resource.data.participants;
    }
    
    // Messages subcollection
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}
```

## Service Implementation

### ChatService Methods
- `createChat(userIds: string[])`: Create a new chat between users
- `sendMessage(chatId: string, messageData: MessageData)`: Send a message in a chat
- `getChats(userId: string)`: Get list of chats for a user
- `getMessages(chatId: string)`: Get messages in a chat
- `markMessagesAsRead(chatId: string, userId: string)`: Mark messages as read
- `subscribeToChatUpdates(chatId: string, callback)`: Listen for real-time chat updates
- `subscribeToMessageUpdates(chatId: string, callback)`: Listen for real-time message updates

## Performance Considerations

### 1. Message Pagination
- Implement pagination for message history to prevent loading large amounts of data
- Use Firestore limits and cursors for efficient pagination

### 2. Chat Previews
- Store last message in chat document to avoid fetching entire message history for previews
- Update last message efficiently to minimize writes

### 3. Real-time Updates
- Use Firestore real-time listeners for immediate message delivery
- Implement proper cleanup to prevent memory leaks
- Optimize listener usage to reduce costs

### 4. Indexing
- Create compound indexes for efficient querying of chats by participants and timestamps
- Ensure proper indexing for message queries by timestamp

## Error Handling

### Common Error Scenarios:
1. **Unauthorized Access**: Attempting to access chats not belonging to the user
2. **Network Issues**: Retry mechanism with exponential backoff
3. **Rate Limiting**: Throttling for excessive requests
4. **Data Validation**: Invalid message formats or content

### Error Recovery:
- Graceful degradation when offline
- Local message queuing for failed sends
- Connection status indicators
- Detailed logging for debugging

## Scaling Strategies

### 1. Horizontal Scaling
- Firestore's distributed architecture handles scaling automatically
- Proper document structure prevents hotspots
- Use sharding strategies for very large chat volumes

### 2. Data Archiving
- Implement automatic archiving of old messages
- Move historical data to separate collections
- Use Cloud Functions for automated cleanup

### 3. Caching Strategies
- Implement client-side caching for chat lists
- Use memory caching for active conversations
- Consider CDN for media attachments

### 4. Message Delivery Optimization
- Implement message batching for high-volume periods
- Use offline capabilities for message queuing
- Optimize push notifications for message arrival