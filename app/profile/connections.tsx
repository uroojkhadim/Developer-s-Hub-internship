import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'Followers' | 'Following';

interface Connection {
  id: string;
  username: string;
  fullName: string;
  type: TabKey;
  isFollowingBack: boolean;
}

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: '1',
    username: 'alex_dev',
    fullName: 'Alex Rivera',
    type: 'Followers',
    isFollowingBack: true,
  },
  {
    id: '2',
    username: 'sarah_design',
    fullName: 'Sarah Jenkins',
    type: 'Followers',
    isFollowingBack: false,
  },
  {
    id: '3',
    username: 'marco_px',
    fullName: 'Marco Rossi',
    type: 'Following',
    isFollowingBack: true,
  },
  {
    id: '4',
    username: 'luna_beats',
    fullName: 'Luna Skye',
    type: 'Followers',
    isFollowingBack: false,
  },
  {
    id: '5',
    username: 'dev_dan',
    fullName: 'Daniel Cho',
    type: 'Following',
    isFollowingBack: true,
  },
  {
    id: '6',
    username: 'emily_arch',
    fullName: 'Emily Stone',
    type: 'Followers',
    isFollowingBack: false,
  },
  {
    id: '7',
    username: 'theo_vision',
    fullName: 'Theo Wright',
    type: 'Following',
    isFollowingBack: true,
  },
];

export default function ConnectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('Followers');
  const [search, setSearch] = useState('');

  const filtered = MOCK_CONNECTIONS.filter(
    item =>
      item.type === activeTab &&
      (item.username.toLowerCase().includes(search.toLowerCase()) ||
        item.fullName.toLowerCase().includes(search.toLowerCase())),
  );

  const followersCount = MOCK_CONNECTIONS.filter(c => c.type === 'Followers')
    .length;
  const followingCount = MOCK_CONNECTIONS.filter(c => c.type === 'Following')
    .length;

  const renderItem = ({ item }: { item: Connection }) => {
    const showFollowingPill = item.isFollowingBack;

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {item.fullName.charAt(0)}
            </Text>
          </View>
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.fullName}>{item.fullName}</Text>
        </View>
        <View style={styles.cardRight}>
          {showFollowingPill ? (
            <View style={styles.followingPill}>
              <Text style={styles.followingPillText}>Following</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Connect</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <MaterialIcons name="more-vert" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <MaterialIcons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search connections..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs with counts */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'Followers' && styles.tabItemActive,
          ]}
          onPress={() => setActiveTab('Followers')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Followers' && styles.tabLabelActive,
            ]}
          >
            Followers
          </Text>
          <Text style={styles.tabCount}>{followersCount.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'Following' && styles.tabItemActive,
          ]}
          onPress={() => setActiveTab('Following')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Following' && styles.tabLabelActive,
            ]}
          >
            Following
          </Text>
          <Text style={styles.tabCount}>
            {followingCount.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Underline */}
      <View style={styles.tabUnderlineTrack}>
        <View
          style={[
            styles.tabUnderline,
            activeTab === 'Following' && styles.tabUnderlineRight,
          ]}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5FA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 15,
    color: '#111827',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
  },
  tabItemActive: {},
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#0EA5E9',
  },
  tabCount: {
    marginTop: 2,
    fontSize: 13,
    color: '#9CA3AF',
  },
  tabUnderlineTrack: {
    height: 3,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabUnderline: {
    position: 'absolute',
    left: 16,
    right: '50%',
    height: 3,
    backgroundColor: '#0EA5E9',
    borderRadius: 999,
  },
  tabUnderlineRight: {
    left: '50%',
    right: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  cardCenter: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  fullName: {
    marginTop: 2,
    fontSize: 14,
    color: '#6B7280',
  },
  cardRight: {
    marginLeft: 12,
  },
  followButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  followingPill: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  followingPillText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '600',
  },
});

