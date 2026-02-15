import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import type { RootState } from '../../store';

import chatService, { Message } from '../../services/chatService';
import userService, { UserProfile } from '../../services/userService';
import theme from '../../theme';
import { RootStackParamList } from '../../navigation/types';

import ChatInput from '../../components/chat/ChatInput';

type ChatRoomScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { chatId, receiverId, receiverName, receiverAvatar } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [receiverProfile, setReceiverProfile] = useState<UserProfile | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  // Load initial messages and receiver profile
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load messages for this chat
      const result = await chatService.getMessages(chatId);
      setMessages(result.messages);
      
      // Load receiver's profile
      const profile = await userService.getUserProfile(receiverId);
      setReceiverProfile(profile);
      
      // Mark messages as read
      await chatService.markMessagesAsRead(chatId, user?.uid || '');
    } catch (error) {
      console.error('Error loading chat data:', error);
      Alert.alert('Error', 'Failed to load chat data');
    } finally {
      setLoading(false);
    }
  }, [chatId, receiverId, user?.uid]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Set up real-time listener for messages
  useEffect(() => {
    const unsubscribe = chatService.subscribeToChatMessages(
      chatId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.error('Error in message subscription:', error);
        Alert.alert('Error', 'Failed to listen for new messages');
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user) return;

    try {
      // Send the message
      const newMessage = await chatService.sendMessage({
        text: text.trim(),
        receiverId,
        chatId,
      });

      // Add to local state (will be updated by real-time listener anyway)
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message: Message): boolean => {
    return message.senderId === user?.uid;
  };

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isMyMsg = isMyMessage(message);
    const positionStyle = isMyMsg ? styles.myMessageContainer : styles.otherMessageContainer;
    const bubbleStyle = isMyMsg ? styles.myMessageBubble : styles.otherMessageBubble;
    const textStyle = isMyMsg ? styles.myMessageText : styles.otherMessageText;

    return (
      <View style={[styles.messageRow, positionStyle]}>
        <View style={[styles.messageBubble, bubbleStyle]}>
          <Text style={textStyle}>{message.text}</Text>
          <Text style={[styles.messageTime, isMyMsg ? styles.myMessageTime : styles.otherMessageTime]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const keyExtractor = (item: Message) => item.id;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.dark} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {receiverProfile?.name
                ? receiverProfile.name.charAt(0).toUpperCase()
                : receiverName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.receiverName} numberOfLines={1}>
              {receiverProfile?.name || receiverName}
            </Text>
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesListContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (!isKeyboardVisible) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}

      />

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        placeholder="Type a message..."
      />
    </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.white,
  },
  receiverName: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.dark,
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.success,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContainer: {
    paddingVertical: theme.spacing.md,
    paddingBottom: 20,
  },
  messageRow: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 15,
  },
  myMessageBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  messageText: {
    fontSize: theme.typography.body1.fontSize,
  },
  myMessageText: {
    color: theme.colors.white,
  },
  otherMessageText: {
    color: theme.colors.dark,
  },
  messageTime: {
    fontSize: theme.typography.caption.fontSize,
    marginTop: theme.spacing.xs,
  },
  myMessageTime: {
    color: theme.colors.gray[200],
    textAlign: 'right',
  },
  otherMessageTime: {
    color: theme.colors.gray[500],
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxHeight: 100,
    fontSize: theme.typography.body1.fontSize,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    padding: theme.spacing.md,
    borderRadius: 25,
    backgroundColor: theme.colors.light,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatRoomScreen;