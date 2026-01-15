import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Conversation {
  id: string;
  name: string;
  message: string;
  timeLabel: string;
  avatarUrl?: string;
  isActive?: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Alex Rivers',
    message: 'Hey, did you see the new post? 📸',
    timeLabel: '2m ago',
    isActive: true,
  },
  {
    id: '2',
    name: 'Jordan Smith',
    message: "Let’s catch up later! I have some ideas…",
    timeLabel: '1h ago',
  },
  {
    id: '3',
    name: 'Casey Chen',
    message: 'The networking event was great. Let’s...',
    timeLabel: '3h ago',
  },
  {
    id: '4',
    name: 'Sam Wilson',
    message: 'Sent an attachment: proposal_v2.pdf',
    timeLabel: 'Yesterday',
  },
  {
    id: '5',
    name: 'Mia Wong',
    message: 'Thanks for the feedback! 🎨',
    timeLabel: 'Tue',
  },
];

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Groups' | 'Archived'>('All');

  const filters: Array<typeof activeFilter> = ['All', 'Unread', 'Groups', 'Archived'];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerLogoCircle}>
            <MaterialIcons name="hub" size={22} color="#0EA5E9" />
          </View>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity style={styles.headerCompose}>
          <MaterialIcons name="edit" size={22} color="#0EA5E9" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends or messages..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {filters.map(filter => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Recent conversations label */}
      <Text style={styles.sectionLabel}>RECENT CONVERSATIONS</Text>

      {/* Conversations list */}
      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isActive = item.isActive;
          return (
            <TouchableOpacity
              style={[styles.conversationCard, isActive && styles.conversationCardActive]}
              activeOpacity={0.9}
            >
              {isActive && <View style={styles.conversationHighlight} />}
              <View style={styles.conversationAvatarWrapper}>
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
                  </View>
                )}
                {isActive && <View style={styles.statusDot} />}
              </View>

              <View style={styles.conversationTextWrapper}>
                <View style={styles.conversationTopRow}>
                  <Text style={styles.conversationName}>{item.name}</Text>
                  <Text style={styles.conversationTime}>{item.timeLabel}</Text>
                </View>
                <Text style={styles.conversationMessage} numberOfLines={1}>
                  {item.message}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating new message button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add-comment" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5FA',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerCompose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0EA5E9',
  },
  filterText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 80,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  conversationCardActive: {
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  conversationHighlight: {
    position: 'absolute',
    left: -2,
    top: 10,
    bottom: 10,
    width: 4,
    borderRadius: 999,
    backgroundColor: '#FACC15',
  },
  conversationAvatarWrapper: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4B5563',
  },
  statusDot: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FACC15',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationTextWrapper: {
    flex: 1,
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  conversationTime: {
    fontSize: 12,
    color: '#60A5FA',
    fontWeight: '600',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#4B5563',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
});
