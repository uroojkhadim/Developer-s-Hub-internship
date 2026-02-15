import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import theme from '../../theme';
import searchService from '../../services/searchService';
import useDebounce from '../../hooks/useDebounce';
import type { UserProfile } from '../../services/userService';
import type { Post } from '../../services/postService';

// Types for search result items
type SearchResultItem = {
  id: string;
  type: 'user' | 'post';
  data: UserProfile | Post;
};

const SearchScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchService.searchAll(term, { limit: 20 });
      
      // Combine users and posts into a single flat array with type indicators
      const combinedResults: SearchResultItem[] = [
        ...searchResults.users.map(user => ({
          id: user.uid,
          type: 'user' as const,
          data: user
        })),
        ...searchResults.posts.map(post => ({
          id: post.id,
          type: 'post' as const,
          data: post
        }))
      ];

      setResults(combinedResults);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      Alert.alert('Search Error', err.message || 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  }, []);



  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
  }, []);

  // Effect to perform search when debounced term changes
  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  const renderResultItem = useCallback(({ item }: { item: SearchResultItem }) => {
    if (item.type === 'user') {
      const user = item.data as UserProfile;
      return (
        <TouchableOpacity style={styles.resultItem}>
          <View style={styles.avatarContainer}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
            <Text style={styles.userBio} numberOfLines={1}>{user.bio || 'No bio'}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={theme.colors.gray[400]} />
        </TouchableOpacity>
      );
    } else {
      const post = item.data as Post;
      return (
        <TouchableOpacity style={styles.resultItem}>
          <View style={styles.postContent}>
            <Text style={styles.postText} numberOfLines={3}>{post.content}</Text>
            {post.imageUrl && (
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
            )}
          </View>
          <View style={styles.postMeta}>
            <Text style={styles.postUsername}>{post.username}</Text>
            <Text style={styles.postStats}>
              {post.likes} likes • {post.comments} comments
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }, []);

  const keyExtractor = useCallback((item: SearchResultItem) => `${item.type}-${item.id}`, []);

  const groupedResults = useMemo(() => {
    const users = results.filter(item => item.type === 'user');
    const posts = results.filter(item => item.type === 'post');
    
    return [
      ...(users.length > 0 ? [{ id: 'users-header', type: 'header', title: 'Users' } as const] : []),
      ...users,
      ...(posts.length > 0 ? [{ id: 'posts-header', type: 'header', title: 'Posts' } as const] : []),
      ...posts,
    ];
  }, [results]);

  const renderListItem = useCallback(({ item }: any) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    }
    return renderResultItem({ item });
  }, [renderResultItem]);

  const listKeyExtractor = useCallback((item: any) => {
    if (item.type === 'header') {
      return item.id;
    }
    return `${item.type}-${item.id}`;
  }, []);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon 
            name="search" 
            size={20} 
            color={theme.colors.gray[500]} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search users or posts..."
            placeholderTextColor={theme.colors.gray[400]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results List */}
      {!loading && !error && (
        <FlatList
          data={groupedResults}
          renderItem={renderListItem}
          keyExtractor={listKeyExtractor}
          initialNumToRender={8}
          maxToRenderPerBatch={4}
          windowSize={9}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : null}
          ListEmptyComponent={
            searchTerm ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found for "{searchTerm}"</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Start typing to search</Text>
              </View>
            )
          }
          getItemLayout={(data, index) => {
            // Different heights for headers vs items
            const item = data?.[index];
            if (item && item.type === 'header') {
              return {
                length: 40, // Height of section header
                offset: 40 * index, // Simplified calculation
                index,
              };
            }
            // For user and post items
            return {
              length: item?.type === 'user' ? 80 : 120, // Different heights for user vs post items
              offset: 100 * index, // Approximate average height
              index,
            };
          }}
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
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.danger + '20',
    margin: theme.spacing.md,
    borderRadius: 8,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    fontSize: theme.typography.body2.fontSize,
  },
  sectionHeader: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  sectionHeaderText: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  resultItem: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: theme.typography.body1.fontSize,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  userBio: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[600],
  },
  postContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  postText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  postImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  postMeta: {
    justifyContent: 'space-between',
  },
  postUsername: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '600',
    color: theme.colors.dark,
  },
  postStats: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
});

export default SearchScreen;