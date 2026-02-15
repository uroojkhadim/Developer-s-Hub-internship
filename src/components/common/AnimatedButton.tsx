import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../theme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: object;
  scaleIntensity?: number;
}

const AnimatedButton = forwardRef<TouchableOpacity, AnimatedButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  scaleIntensity = 0.95,
}, ref) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(scaleIntensity, {
      damping: 10,
      stiffness: 300,
    });
    
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 300,
    });
    
    opacity.value = withTiming(1, { duration: 100 });
  };

  const buttonStyle = [styles.button, styles[variant], disabled && styles.disabled, style];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    loading && styles.loadingText,
  ];

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        ref={ref}
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
          />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: '600' as '600',
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.gray[500],
  },
  loadingText: {
    opacity: 0.7,
  },
});

export default AnimatedButton;