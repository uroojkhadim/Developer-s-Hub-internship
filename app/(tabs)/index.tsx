import PostList from '@/components/PostList';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Social Connect</ThemedText>
        {user && (
          <ThemedText type="defaultSemiBold">
            Welcome back, {user.name || 'User'}!
          </ThemedText>
        )}
      </ThemedView>
      
      <View style={styles.content}>
        <PostList />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
});
