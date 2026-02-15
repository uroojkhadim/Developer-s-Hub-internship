import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockGridItems = [
  'https://images.pexels.com/photos/3404200/pexels-photo-3404200.jpeg',
  'https://images.pexels.com/photos/1029615/pexels-photo-1029615.jpeg',
  'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg',
  'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg',
  'https://images.pexels.com/photos/34088/pexels-photo.jpg',
  'https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg',
  'https://images.pexels.com/photos/3404200/pexels-photo-3404200.jpeg',
  'https://images.pexels.com/photos/1029615/pexels-photo-1029615.jpeg',
  'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg',
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const displayName = user?.name || 'Alex Rivers';
  const username = user?.email?.split('@')[0] || 'alex_rivers';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <MaterialIcons name="settings" size={24} color="#111827" />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={styles.topBarTitle}>
          @{username}
        </ThemedText>
        <TouchableOpacity>
          <MaterialIcons name="ios-share" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar & basic info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuterRing}>
            <View style={styles.avatarInnerRing}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <MaterialIcons 
                  name="account-circle" 
                  size={120} 
                  color="#9CA3AF" 
                />
              )
            </View>
            <View style={styles.avatarBadge}>
              <MaterialIcons name="verified-user" size={16} color="#FFFFFF" />
            </View>
          </View>

          <ThemedText type="title" style={styles.name}>
            {displayName}
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.role}>
            Digital Artist & Creative Technologist
          </ThemedText>
          <ThemedText style={styles.bio}>
            Exploring the intersection of pixels and human emotion. Based in Brooklyn. 🎨✨
          </ThemedText>

          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color="#6B7280" />
            <ThemedText style={styles.locationText}>New York, NY</ThemedText>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryButton}>
            <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
              Edit Profile
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <MaterialIcons name="person-add" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <ThemedText type="title" style={styles.statNumber}>
              128
            </ThemedText>
            <ThemedText style={styles.statLabel}>Posts</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="title" style={styles.statNumber}>
              1.2k
            </ThemedText>
            <ThemedText style={styles.statLabel}>Followers</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="title" style={styles.statNumber}>
              850
            </ThemedText>
            <ThemedText style={styles.statLabel}>Following</ThemedText>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
            <MaterialIcons name="grid-on" size={22} color="#0EA5E9" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="play-circle-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="bookmark-border" size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="person-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {mockGridItems.map((uri, index) => (
            <View key={uri + index} style={styles.gridItem}>
              <Image source={{ uri }} style={styles.gridImage} />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topBarTitle: {
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    paddingTop: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22D3EE',
    padding: 4,
    marginBottom: 16,
  },
  avatarInnerRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 10,
    right: 18,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    marginTop: 4,
    fontSize: 22,
    textAlign: 'center',
  },
  role: {
    marginTop: 6,
    fontSize: 13,
    color: '#0EA5E9',
    textAlign: 'center',
  },
  bio: {
    marginTop: 10,
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsCard: {
    marginTop: 20,
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  tabItem: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0EA5E9',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  gridItem: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});

