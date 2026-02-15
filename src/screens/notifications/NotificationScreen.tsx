import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Button } from '../../components';
import { useNotifications, useUnreadCount } from '../../hooks/useNotifications';
import theme from '../../theme';
import type { Notification } from '../../models/Notification';
import { NotificationType } from '../../models/Notification';

const NotificationScreen: React.FC = () => {
  const { 
    notifications, 
    loading, 
    error, 
    refresh, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications(50);
  
  const { unreadCount } = useUnreadCount();

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark notifications as read');
    }
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete notification');
            }
          },
        },
      ]
    );
  }, [deleteNotification]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to relevant content based on notification type
    switch (notification.type) {
      case NotificationType.LIKE:
      case NotificationType.COMMENT:
        // Navigate to post
        if (notification.postId) {
          console.log('Navigate to post:', notification.postId);
          // navigation.navigate('PostDetail', { postId: notification.postId });
        }
        break;
      case NotificationType.REPLY:
        // Navigate to comment thread
        if (notification.commentId) {
          console.log('Navigate to comment:', notification.commentId);
        }
        break;
      default:
        console.log('Notification pressed:', notification);
    }
  }, [markAsRead]);

  const getNotificationIcon = useCallback((type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE:
        return '❤️';
      case NotificationType.COMMENT:
        return '💬';
      case NotificationType.REPLY:
        return '↩️';
      case NotificationType.FOLLOW:
        return '👤';
      case NotificationType.MENTION:
        return '@';
      case NotificationType.SYSTEM:
        return '📢';
      default:
        return '🔔';
    }
  }, []);

  const formatTimeAgo = useCallback((date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }, []);

  const renderNotification = useCallback(({ item }: { item: Notification }) => (
    <Card 
      style={[
        styles.notificationCard,
        !item.read && styles.unreadNotification
      ]}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIconContainer}>
            <Text style={styles.notificationIcon}>
              {getNotificationIcon(item.type)}
            </Text>
          </View>
          <View style={styles.notificationTextContainer}>
            <Text style={[
              styles.notificationTitle,
              !item.read && styles.unreadTitle
            ]}>
              {item.title}
            </Text>
            <Text style={styles.notificationBody} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          <Button
            title="✕"
            variant="outline"
            onPress={() => handleDeleteNotification(item.id)}
            style={styles.deleteButton}
          />
        </View>
        
        {!item.read && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
    </Card>
  ), [getNotificationIcon, formatTimeAgo, handleDeleteNotification]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyText}>
          {loading ? 'Loading notifications...' : 'You have no notifications yet.'}
        </Text>
      </Card>
    </View>
  ), [loading]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
          <Button
            title="Mark All Read"
            variant="outline"
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            style={[styles.markAllButton, { minWidth: 120 }]}
          />
        </View>
      </View>
    </View>
  ), [unreadCount, handleMarkAllAsRead]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            title="Retry" 
            onPress={refresh} 
            style={styles.retryButton} 
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {loading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReachedThreshold={0.1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[300],
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
  markAllButton: {
    minWidth: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.light,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
  },
  listContainer: {
    padding: theme.spacing.sm,
  },
  notificationCard: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  unreadNotification: {
    backgroundColor: theme.colors.gray[100],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  deleteButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: -theme.spacing.lg,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
});

export default NotificationScreen;