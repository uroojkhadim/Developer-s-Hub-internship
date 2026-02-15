import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { Card, Button } from '../../components';
import chatService, { Chat } from '../../services/chatService';
import userService, { UserProfile } from '../../services/userService';
import theme from '../../theme';
import type { RootState } from '../../store';
import { RootStackParamList } from '../../navigation/types';

type ChatListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatList'>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [otherUserProfiles, setOtherUserProfiles] = useState<Record<string, UserProfile>>({});

  // Load chats and user profiles
  const loadChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await chatService.getUserChats({ limit: 20 });
      setChats(result.chats);

      // Fetch profiles for other users in chats
      const profiles: Record<string, UserProfile> = {};
      for (const chat of result.chats) {
        for (const participantId of chat.participants) {
          if (participantId !== user.uid && !otherUserProfiles[participantId]) {
            const profile = await userService.getUserProfile(participantId);
            if (profile) {
              profiles[participantId] = profile;
            }
          }
        }
      }
      setOtherUserProfiles(prev => ({ ...prev, ...profiles }));
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [user, otherUserProfiles]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Set up real-time listener for chat updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = chatService.subscribeToUserChats(
      user.uid,
      (updatedChats) => {
        setChats(updatedChats);
      },
      (error) => {
        console.error('Error in chat subscription:', error);
        Alert.alert('Error', 'Failed to listen for chat updates');
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChats().finally(() => setRefreshing(false));
  }, [loadChats]);

  const getOtherParticipant = (chat: Chat): string => {
    if (!user) return '';
    return chat.participants.find(id => id !== user.uid) || '';
  };

  const getOtherUserProfile = (participantId: string): UserProfile | null => {
    return otherUserProfiles[participantId] || null;
  };

  const getLastMessagePreview = (chat: Chat): string => {
    if (chat.lastMessage) {
      return chat.lastMessage.text.length > 50 
        ? `${chat.lastMessage.text.substring(0, 50)}...` 
        : chat.lastMessage.text;
    }
    return 'New chat';
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise, show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleChatPress = (chat: Chat) => {
    const otherUserId = getOtherParticipant(chat);
    const otherUser = getOtherUserProfile(otherUserId);
    
    if (otherUser) {
      navigation.navigate('ChatRoom', {
        chatId: chat.id,
        receiverId: otherUserId,
        receiverName: otherUser.name,
        receiverAvatar: otherUser.profileImage,
      });
    }
  };

  const renderChatItem = ({ item: chat }: { item: Chat }) => {
    const otherUserId = getOtherParticipant(chat);
    const otherUser = getOtherUserProfile(otherUserId);

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(chat)}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {otherUser?.name
                ? otherUser.name.charAt(0).toUpperCase()
                : otherUserId.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          {chat.unreadCounts[user?.uid || ''] > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {chat.unreadCounts[user?.uid || '']}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.topRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {otherUser?.name || 'User'}
            </Text>
            <Text style={styles.time}>
              {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
            </Text>
          </View>
          
          <View style={styles.bottomRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {getLastMessagePreview(chat)}
            </Text>
            {chat.unreadCounts[user?.uid || ''] > 0 && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Card style={styles.emptyCard}>
        <Icon name="chatbubbles-outline" size={60} color={theme.colors.gray[400]} />
        <Text style={styles.emptyTitle}>No Chats Yet</Text>
        <Text style={styles.emptyText}>
          Start a conversation with someone to see it here
        </Text>
        <Button
          title="Find People"
          variant="primary"
          onPress={() => navigation.navigate('Search' as never)}
          style={styles.searchButton}
        />
      </Card>
    </View>
  );

  if (loading && chats.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={11}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: 100, // Approximate height of each chat item
          offset: 100 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
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
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.white,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  userName: {
    flex: 1,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.dark,
  },
  time: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[600],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.md,
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
    width: '90%',
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
    marginVertical: theme.spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  searchButton: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
});

export default ChatListScreen;