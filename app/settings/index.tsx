import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('../../auth/login');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message || 'An error occurred during logout');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Account deletion would happen here in a real app')
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option} onPress={() => router.push('../profile')}>
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Privacy Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notification Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>App Preferences</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.option, styles.dangerOption]} onPress={handleDeleteAccount}>
          <Text style={[styles.optionText, styles.dangerText]}>Delete Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.option, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.optionText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 20,
  },
  option: {
    backgroundColor: '#fff',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dangerOption: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  logoutButton: {
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  dangerText: {
    color: '#f44336',
  },
});