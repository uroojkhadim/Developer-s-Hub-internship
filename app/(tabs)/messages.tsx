import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToMessages } from '@/services/chatService';
import { scheduleLocalNotification } from '@/services/notificationService';
import { searchUsers } from '@/services/userService';

interface Message {
  id: string;
  text: string;
  from: string;
  to: string;
  createdAt: Date;
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const [target, setTarget] = useState<any | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!user || !target) return;
    const unsub = subscribeToMessages(user.id, target.id, msgs => {
      setMessages(msgs);
      const latest = msgs[msgs.length - 1];
      if (latest && latest.from !== user.id) {
        scheduleLocalNotification('New message', latest.text, { from: latest.from, type: 'message' });
      }
    });
    return () => unsub && unsub();
  }, [user, target]);

  const search = async () => {
    try {
      const res = await searchUsers(query);
      setResults(res.filter(r => r.id !== user?.id));
    } catch (error) {
      console.error('search error', error);
      Alert.alert('Error', 'Could not search users');
    }
  };

  const handleSend = async () => {
    if (!user || !target || !text.trim()) return;
    try {
      await sendMessage(user.id, target.id, text.trim());
      setText('');
    } catch (error) {
      console.error('send error', error);
      Alert.alert('Error', 'Message not sent');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const mine = item.from === user?.id;
    return (
      <View style={[styles.msg, mine ? styles.msgMine : styles.msgTheirs]}>
        <Text style={styles.msgText}>{item.text}</Text>
        <Text style={styles.msgMeta}>{item.createdAt?.toLocaleTimeString?.() || ''}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Messages</Text>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search user to chat"
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search}>
          <Text style={styles.searchText}>Find</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={results}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.userChip, target?.id === item.id && styles.userChipActive]} onPress={() => setTarget(item)}>
            <Text style={[styles.userChipText, target?.id === item.id && styles.userChipTextActive]}>
              {item.name || item.email}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Search to start a chat</Text>}
        contentContainerStyle={{ paddingVertical: 6 }}
      />

      <FlatList
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
      />

      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
          style={styles.composerInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, backgroundColor: '#fff' },
  searchBtn: { backgroundColor: '#1a73e8', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 10 },
  searchText: { color: '#fff', fontWeight: '700' },
  userChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#e0e0e0', marginRight: 8 },
  userChipActive: { backgroundColor: '#1a73e8' },
  userChipText: { color: '#333' },
  userChipTextActive: { color: '#fff' },
  empty: { color: '#888', marginTop: 10 },
  messages: { flexGrow: 1, paddingVertical: 10 },
  msg: { maxWidth: '70%', marginVertical: 4, padding: 10, borderRadius: 10 },
  msgMine: { alignSelf: 'flex-end', backgroundColor: '#d1e8ff' },
  msgTheirs: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  msgText: { fontSize: 15 },
  msgMeta: { fontSize: 11, color: '#666', marginTop: 4 },
  composer: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
  composerInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, backgroundColor: '#fff' },
  sendBtn: { backgroundColor: '#1a73e8', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
});
