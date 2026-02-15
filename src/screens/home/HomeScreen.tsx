import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import FeedScreen from './FeedScreen';
import theme from '../../theme';
import type { RootState } from '../../store';

const HomeScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <Text style={styles.welcomeText}>Welcome back, {user?.displayName || 'User'}!</Text>
      </View>

      <FeedScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  welcomeText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[600],
  },
});

export default HomeScreen;
