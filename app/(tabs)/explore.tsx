import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { followUser, searchUsers, unfollowUser } from '@/services/userService';

export default function ExploreScreen() {
  const { user } = useAuth();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await searchUsers(term);
      setResults(data.filter((u: any) => u.id !== user?.id));
    } catch (error) {
      console.error('Search error', error);
      Alert.alert('Search error', 'Could not search users');
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (targetId: string, isFollowing: boolean) => {
    if (!user) return;
    try {
      if (isFollowing) {
        await unfollowUser(user.id, targetId);
      } else {
        await followUser(user.id, targetId);
      }
      handleSearch();
    } catch (error) {
      console.error('Follow error', error);
      Alert.alert('Error', 'Could not update follow status');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFollowing = item.followers?.includes(user?.id);
    return (
      <View style={styles.resultCard}>
        <View>
          <Text style={styles.name}>{item.name || item.email}</Text>
          <Text style={styles.sub}>{item.bio || item.email}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={() => toggleFollow(item.id, isFollowing)}
        >
          <Text style={[styles.followText, isFollowing && styles.followingText]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search users</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search by name or email"
          value={term}
          onChangeText={setTerm}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          <Text style={styles.searchText}>{loading ? '...' : 'Go'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>No users yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  searchBtn: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchText: {
    color: '#fff',
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    color: '#666',
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a73e8',
  },
  followingBtn: {
    backgroundColor: '#e0e0e0',
  },
  followText: {
    color: '#fff',
    fontWeight: '700',
  },
  followingText: {
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
