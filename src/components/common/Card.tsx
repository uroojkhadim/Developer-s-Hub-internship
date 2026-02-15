import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: object;
  onPress?: () => void;
  elevation?: number;
}

const Card: React.FC<CardProps> = ({ children, style, onPress, elevation = 2 }) => {
  const cardStyle = [styles.card, { elevation }, style];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
});

export default Card;
