import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SectionKey = 'Today' | 'Yesterday' | 'This Week';

interface ActivityItem {
  id: string;
  section: SectionKey;
  actorName: string;
  message: string;
  timeLabel: string;
  hasFollowButton?: boolean;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    section: 'Today',
    actorName: 'Alex Rivera',
    message: 'liked your post.',
    timeLabel: '2h ago',
  },
  {
    id: '2',
    section: 'Today',
    actorName: 'Sarah Jenkins',
    message: 'started following you.',
    timeLabel: '5h ago',
    hasFollowButton: true,
  },
  {
    id: '3',
    section: 'Today',
    actorName: 'Marcus Chen',
    message: 'commented: “Nice shot! Looking good!”',
    timeLabel: '8h ago',
  },
  {
    id: '4',
    section: 'Yesterday',
    actorName: 'Elena Gilbert',
    message: 'and 4 others liked your photo.',
    timeLabel: '1d ago',
  },
  {
    id: '5',
    section: 'Yesterday',
    actorName: 'Jordan Lee',
    message: 'started following you.',
    timeLabel: '1d ago',
    hasFollowButton: true,
  },
  {
    id: '6',
    section: 'This Week',
    actorName: 'Taylor Swift',
    message: 'commented: “Amazing perspective!”',
    timeLabel: '3d ago',
  },
];

const sectionOrder: SectionKey[] = ['Today', 'Yesterday', 'This Week'];

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();

  const grouped = sectionOrder.map(section => ({
    section,
    items: MOCK_ACTIVITY.filter(item => item.section === section),
  }));

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{item.actorName.charAt(0)}</Text>
        </View>
      </View>
      <View style={styles.cardCenter}>
        <Text style={styles.cardText}>
          <Text style={styles.cardActor}>{item.actorName} </Text>
          <Text style={styles.cardMessage}>{item.message}</Text>
        </Text>
        <Text style={styles.cardTime}>{item.timeLabel}</Text>
      </View>
      <View style={styles.cardRight}>
        {item.hasFollowButton ? (
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.previewSquare} />
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.logoRow}>
          <View style={styles.logoDotCluster}>
            <View style={styles.logoDot} />
            <View style={styles.logoDot} />
            <View style={styles.logoDot} />
            <View style={styles.logoDot} />
          </View>
          <Text style={styles.brandText}>Social Connect</Text>
        </View>
        <View style={styles.headerIcons}>
          <MaterialIcons name="search" size={24} color="#111827" />
          <MaterialIcons name="more-vert" size={24} color="#111827" />
        </View>
      </View>

      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {/* Sections */}
      <FlatList
        data={grouped}
        keyExtractor={section => section.section}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: section }) => (
          <View>
            <Text style={styles.sectionLabel}>{section.section.toUpperCase()}</Text>
            {section.items.map(activity => (
              <View key={activity.id} style={styles.sectionCardWrapper}>
                {renderItem({ item: activity })}
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

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
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDotCluster: {
    width: 32,
    height: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5E9',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  sectionCardWrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4B5563',
  },
  cardCenter: {
    flex: 1,
  },
  cardText: {
    fontSize: 15,
    color: '#111827',
  },
  cardActor: {
    fontWeight: '700',
  },
  cardMessage: {
    fontWeight: '400',
  },
  cardTime: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  cardRight: {
    marginLeft: 12,
  },
  followButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0EA5E9',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  previewSquare: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
});

export default NotificationsScreen;
