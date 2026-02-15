export interface Notification {
  id: string;
  recipientId: string; // User who receives the notification
  senderId: string;    // User who triggered the notification
  senderName: string;  // Display name of sender
  senderAvatar: string | null; // Avatar URL of sender
  type: NotificationType;
  title: string;
  body: string;
  postId?: string;     // Related post ID (for likes/comments)
  commentId?: string;  // Related comment ID (for replies)
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  REPLY = 'reply',
  FOLLOW = 'follow',
  MENTION = 'mention',
  SYSTEM = 'system'
}

export interface CreateNotificationData {
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  type: NotificationType;
  title: string;
  body: string;
  postId?: string;
  commentId?: string;
}

export interface NotificationQueryParams {
  limit?: number;
  lastVisible?: any;
  unreadOnly?: boolean;
}