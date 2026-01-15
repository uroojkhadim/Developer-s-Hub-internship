import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HASHTAGS = ['#Trending', '#Architecture', '#Minimalism', '#Portraits'];

const EXPLORE_IMAGES = [
  'https://images.pexels.com/photos/3404200/pexels-photo-3404200.jpeg',
  'https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg',
  'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg',
  'https://images.pexels.com/photos/37347/office-freelancer-computer-business-37347.jpeg',
  'https://images.pexels.com/photos/34088/pexels-photo.jpg',
  'https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg',
];

const TOP_NETWORKS = [
  {
    id: '1',
    name: 'Julian Vesta',
    handle: '@jvesta_creative',
  },
  {
    id: '2',
    name: 'Maya Lin',
    handle: '@mayalin.design',
  },
  {
    id: '3',
    name: 'Leo Brooks',
    handle: '@brooks_studio',
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Posts' | 'Users'>('Posts');
  const [activeHashtag, setActiveHashtag] = useState(HASHTAGS[0]);

  const leftColumn = EXPLORE_IMAGES.filter((_, index) => index % 2 === 0);
  const rightColumn = EXPLORE_IMAGES.filter((_, index) => index % 2 !== 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Design inspiration"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <TouchableOpacity>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabChip,
              activeTab === 'Posts' && styles.tabChipActive,
            ]}
            onPress={() => setActiveTab('Posts')}
          >
            <Text
              style={[
                styles.tabChipText,
                activeTab === 'Posts' && styles.tabChipTextActive,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabChip,
              activeTab === 'Users' && styles.tabChipActive,
            ]}
            onPress={() => setActiveTab('Users')}
          >
            <Text
              style={[
                styles.tabChipText,
                activeTab === 'Users' && styles.tabChipTextActive,
              ]}
            >
              Users
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hashtags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hashtagRow}
        >
          {HASHTAGS.map(tag => {
            const isActive = tag === activeHashtag;
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.hashtagChip, isActive && styles.hashtagChipActive]}
                onPress={() => setActiveHashtag(tag)}
              >
                <Text
                  style={[
                    styles.hashtagText,
                    isActive && styles.hashtagTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Explore header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Feed</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Masonry grid */}
        <View style={styles.masonryRow}>
          <View style={styles.masonryColumn}>
            {leftColumn.map(uri => (
              <View key={uri} style={styles.masonryItem}>
                <Image source={{ uri }} style={styles.masonryImage} />
              </View>
            ))}
          </View>
          <View style={styles.masonryColumn}>
            {rightColumn.map(uri => (
              <View key={uri} style={styles.masonryItem}>
                <Image source={{ uri }} style={styles.masonryImage} />
              </View>
            ))}
          </View>
        </View>

        {/* Top Networks */}
        <View style={styles.topNetworksHeader}>
          <Text style={styles.topNetworksTitle}>Top Networks</Text>
        </View>
        <View style={styles.topNetworksList}>
          {TOP_NETWORKS.map(person => (
            <View key={person.id} style={styles.networkCard}>
              <View style={styles.networkLeft}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {person.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.networkName}>{person.name}</Text>
                  <Text style={styles.networkHandle}>{person.handle}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 15,
    color: '#111827',
  },
  cancelText: {
    fontSize: 15,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tabChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  tabChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabChipTextActive: {
    color: '#0EA5E9',
  },
  hashtagRow: {
    paddingVertical: 4,
    marginBottom: 12,
  },
  hashtagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  hashtagChipActive: {
    backgroundColor: '#0EA5E9',
  },
  hashtagText: {
    fontSize: 13,
    color: '#4B5563',
  },
  hashtagTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 13,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  masonryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  masonryColumn: {
    flex: 1,
  },
  masonryItem: {
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  masonryImage: {
    width: '100%',
    height: 220,
  },
  topNetworksHeader: {
    marginBottom: 8,
  },
  topNetworksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  topNetworksList: {
    gap: 10,
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  networkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  networkName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  networkHandle: {
    fontSize: 12,
    color: '#6B7280',
  },
  followButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
