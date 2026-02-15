import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import theme from '../../theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  placeholder = 'Type a message...', 
  autoFocus = false 
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSend(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && Platform.OS !== 'ios') {
      handleSend();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={inputText}
        onChangeText={setInputText}
        placeholder={placeholder}
        multiline
        maxLength={500}
        autoFocus={autoFocus}
        onKeyPress={handleKeyPress}
      />
      
      <TouchableOpacity
        style={[styles.sendButton, !inputText.trim() ? styles.sendButtonDisabled : {}]}
        onPress={handleSend}
        disabled={!inputText.trim()}
      >
        <Icon 
          name="send" 
          size={24} 
          color={inputText.trim() ? theme.colors.primary : theme.colors.gray[400]} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxHeight: 100,
    fontSize: theme.typography.body1.fontSize,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    padding: theme.spacing.md,
    borderRadius: 25,
    backgroundColor: theme.colors.light,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatInput;