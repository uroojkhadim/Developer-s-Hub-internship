import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../theme';

interface AnimatedHeartProps {
  isLiked: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: object;
}

const AnimatedHeart: React.FC<AnimatedHeartProps> = ({
  isLiked,
  onPress,
  size = 24,
  color = theme.colors.danger,
  style,
}) => {
  const scale = useSharedValue(isLiked ? 1 : 0);
  const opacity = useSharedValue(isLiked ? 1 : 0.5);
  const rotation = useSharedValue(0);
  const bounce = useSharedValue(0);

  // Animation when liked
  useEffect(() => {
    if (isLiked) {
      // Heart pop animation
      scale.value = withSequence(
        withSpring(1.3, { damping: 5, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      
      // Fade in to full opacity
      opacity.value = withTiming(1, { duration: 300 });
      
      // Rotation effect
      rotation.value = withSequence(
        withTiming(15, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 100, easing: Easing.inOut(Easing.ease) })
      );
      
      // Bounce effect
      bounce.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );
    } else {
      // Fade out when unliked
      scale.value = withTiming(0.8, { duration: 200 });
      opacity.value = withTiming(0.5, { duration: 200 });
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [isLiked]);

  const animatedStyle = useAnimatedStyle(() => {
    const interpolatedScale = interpolate(
      bounce.value,
      [0, 1],
      [scale.value, scale.value * 1.1],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: interpolatedScale },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    // Trigger the animation first
    if (!isLiked) {
      // Pre-animation for liking
      scale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.7, { duration: 100 });
    }
    
    // Execute the actual press action
    onPress();
  };

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <Icon
        name={isLiked ? 'heart' : 'heart-outline'}
        size={size}
        color={color}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
  },
});

export default AnimatedHeart;