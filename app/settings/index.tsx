import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Switch } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const { logout, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [privacy, setPrivacy] = useState({
    privateProfile: false,
    hideActivity: false,
  });

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

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      await changePassword(newPassword);
      setNewPassword('');
      Alert.alert('Success', 'Password updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not update password');
    }
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

        <View style={[styles.option, styles.optionRow]}>
          <Text style={styles.optionText}>Private Profile</Text>
          <Switch
            value={privacy.privateProfile}
            onValueChange={v => setPrivacy(prev => ({ ...prev, privateProfile: v }))}
          />
        </View>

        <View style={[styles.option, styles.optionRow]}>
          <Text style={styles.optionText}>Hide Activity</Text>
          <Switch
            value={privacy.hideActivity}
            onValueChange={v => setPrivacy(prev => ({ ...prev, hideActivity: v }))}
          />
        </View>

        <View style={styles.option}>
          <Text style={[styles.optionText, { marginBottom: 8 }]}>Change Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="New password"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity style={[styles.optionButton, styles.saveBtn]} onPress={handleChangePassword}>
            <Text style={styles.optionButtonText}>Update Password</Text>
          </TouchableOpacity>
        </View>
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
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#1a73e8',
  },
  dangerText: {
    color: '#f44336',
  },
});