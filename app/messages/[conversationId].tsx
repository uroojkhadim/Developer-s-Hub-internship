import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DirectMessage {
  id: string;
  type: 'text' | 'event';
  from: 'me' | 'them';
  text?: string;
  timeLabel: string;
}

const MOCK_MESSAGES: DirectMessage[] = [
  {
    id: '1',
    type: 'text',
    from: 'them',
    text:
      'Hey! Did you see the new networking event posted in the group? It looks like a great opportunity to meet some local creators.',
    timeLabel: '10:42 AM',
  },
  {
    id: '2',
    type: 'text',
    from: 'me',
    text: 'Not yet, let me check it out right now. Is it the one on Friday?',
    timeLabel: '10:44 AM',
  },
  {
    id: '3',
    type: 'event',
    from: 'them',
    timeLabel: '',
  },
  {
    id: '4',
    type: 'text',
    from: 'them',
    text: "Yeah, that's the one! I’m thinking of going. Should we grab a coffee first?",
    timeLabel: '',
  },
];

export default function DirectMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name?: string }>();

  const displayName = params.name || 'Alex Johnson';

  const renderMessage = ({ item }: { item: DirectMessage }) => {
    if (item.type === 'event') {
      return (
        <View style={styles.eventCardWrapper}>
          <View style={styles.eventCard}>
            <Image
              source={{
                uri:
                  'https://images.pexels.com/photos/1181395/pexels-photo-1181395.jpeg',
              }}
              style={styles.eventImage}
            />
            <View style={styles.eventTextWrapper}>
              <Text style={styles.eventTitle}>Creators Mixer 2024</Text>
              <Text style={styles.eventMeta}>The Social Hub • Fri, 6:00 PM</Text>
            </View>
          </View>
        </View>
      );
    }

    const isMe = item.from === 'me';
    return (
      <View
        style={[
          styles.bubbleRow,
          isMe ? styles.bubbleRowMe : styles.bubbleRowThem,
        ]}
      >
        {!isMe && (
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniInitial}>A</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleThem,
          ]}
        >
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
        {isMe && <View style={styles.bubbleSpacer} />}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarWrapper}>
            <Image
              source={{
                uri:
                  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
              }}
              style={styles.headerAvatar}
            />
            <View style={styles.headerStatusDot} />
          </View>
          <View>
            <Text style={styles.headerName}>{displayName}</Text>
            <Text style={styles.headerStatus}>ACTIVE NOW</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerInfo}>
          <MaterialIcons name="info-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Today pill */}
      <View style={styles.dayPillWrapper}>
        <View style={styles.dayPill}>
          <Text style={styles.dayPillText}>TODAY</Text>
        </View>
      </View>

      {/* Messages list */}
      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Composer */}
      <View style={styles.composerWrapper}>
        <View style={styles.composerInner}>
          <TouchableOpacity style={styles.cameraButton}>
            <MaterialIcons name="photo-camera" size={22} color="#4B5563" />
          </TouchableOpacity>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            style={styles.composerInput}
          />
          <TouchableOpacity>
            <MaterialIcons name="insert-emoticon" size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.composerSend}>
          <MaterialIcons name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
  },
  headerStatusDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    marginTop: 2,
  },
  headerInfo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  dayPill: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#6B7280',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  bubbleRowThem: {
    justifyContent: 'flex-start',
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarMiniInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleThem: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: '#0EA5E9',
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#0F172A',
  },
  bubbleSpacer: {
    width: 32,
  },
  eventCardWrapper: {
    marginBottom: 16,
  },
  eventCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  eventImage: {
    width: '100%',
    height: 260,
  },
  eventTextWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  composerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  composerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  cameraButton: {
    marginRight: 6,
  },
  composerInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginHorizontal: 6,
  },
  composerSend: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
});

