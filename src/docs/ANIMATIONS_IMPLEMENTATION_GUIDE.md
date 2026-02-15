# React Native Reanimated Animations Implementation Guide

## 🎯 Overview

This document explains how to implement smooth animations in your React Native app using react-native-reanimated v4, with a focus on performance optimization and best practices.

## 🚀 Key Components Implemented

### 1. AnimatedButton Component
**Features:**
- Smooth scale animation on press
- Opacity changes for visual feedback
- Spring physics for natural feel
- Support for all button variants (primary, secondary, outline)
- Disabled and loading states

**Implementation:**
```typescript
const scale = useSharedValue(1);
const opacity = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  opacity: opacity.value,
}));

const handlePressIn = () => {
  scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
  opacity.value = withTiming(0.8, { duration: 100 });
};
```

### 2. AnimatedHeart Component
**Features:**
- Heart pop animation with bounce effect
- Rotation and scale transformations
- Smooth transitions between liked/unliked states
- Sequence animations for complex effects
- Color and size customization

**Implementation:**
```typescript
const scale = useSharedValue(isLiked ? 1 : 0);
const rotation = useSharedValue(0);
const bounce = useSharedValue(0);

// Like animation sequence
scale.value = withSequence(
  withSpring(1.3, { damping: 5, stiffness: 200 }),
  withSpring(1, { damping: 10, stiffness: 150 })
);

rotation.value = withSequence(
  withTiming(15, { duration: 150 }),
  withTiming(-15, { duration: 150 }),
  withTiming(0, { duration: 100 })
);
```

### 3. Screen Transitions
**Features:**
- Smooth navigation transitions
- Modal and stack navigation animations
- Custom interpolators for complex effects
- Performance-optimized transition specs

## ⚡ Performance Optimization Techniques

### 1. Shared Values
Always use `useSharedValue` for animation values:
```typescript
// ✅ Good - Shared values run on UI thread
const scale = useSharedValue(1);

// ❌ Bad - State causes re-renders
const [scale, setScale] = useState(1);
```

### 2. Animated Styles
Use `useAnimatedStyle` for transforms:
```typescript
// ✅ Good - Runs on UI thread
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

// ❌ Bad - Causes JS thread work
const style = { transform: [{ scale: scale.value }] };
```

### 3. Animation Functions
Choose the right animation function:
```typescript
// Use withSpring for natural, physics-based animations
withSpring(target, { damping: 10, stiffness: 300 });

// Use withTiming for precise, controlled animations
withTiming(target, { duration: 300, easing: Easing.ease });

// Use withSequence for complex animation chains
withSequence(
  withSpring(1.2),
  withSpring(1)
);
```

### 4. Interpolation
Use interpolation for smooth value mapping:
```typescript
const interpolatedScale = interpolate(
  progress.value,
  [0, 1],
  [1, 1.2],
  Extrapolate.CLAMP
);
```

## 🎨 Animation Patterns

### 1. Touch Feedback
```typescript
const handlePressIn = () => {
  scale.value = withSpring(0.95);
  opacity.value = withTiming(0.8);
};

const handlePressOut = () => {
  scale.value = withSpring(1);
  opacity.value = withTiming(1);
};
```

### 2. State Change Animations
```typescript
useEffect(() => {
  if (isActive) {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  } else {
    scale.value = withTiming(0.8);
    opacity.value = withTiming(0.5);
  }
}, [isActive]);
```

### 3. Sequential Animations
```typescript
const animateSuccess = () => {
  scale.value = withSequence(
    withSpring(1.2),  // Scale up
    withSpring(1),    // Scale back
    withTiming(0)     // Fade out
  );
};
```

## 🛠️ Configuration

### Babel Configuration
```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',  // Essential for reanimated
  ],
};
```

### Package Installation
```bash
npm install react-native-reanimated
# or
yarn add react-native-reanimated
```

## 📱 Platform Considerations

### iOS
- Native driver performance by default
- Smooth 60 FPS animations
- Excellent spring physics

### Android
- May require additional configuration for optimal performance
- Consider using `LayoutAnimation` for simple cases
- Test on multiple device types

## 🔧 Best Practices

### 1. Animation Principles
- **Purpose**: Every animation should serve a purpose
- **Duration**: Keep animations short (200-500ms typically)
- **Easing**: Use appropriate easing functions
- **Consistency**: Maintain consistent animation patterns

### 2. Performance Guidelines
- Minimize re-renders in animated components
- Use `React.memo` for expensive components
- Avoid heavy computations in animation callbacks
- Test on physical devices, not simulators

### 3. Accessibility
```typescript
// Respect reduced motion settings
const reducedMotion = useReducedMotion();
const animationDuration = reducedMotion ? 0 : 300;
```

## 🎯 Common Use Cases

### 1. Loading States
```typescript
const spin = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{
    rotate: `${spin.value * 360}deg`
  }]
}));

// Start spinning
spin.value = withRepeat(withTiming(1, { duration: 1000 }), -1);
```

### 2. List Item Animations
```typescript
const itemAnimations = items.map(() => ({
  opacity: useSharedValue(0),
  translateY: useSharedValue(50)
}));

// Staggered entrance
itemAnimations.forEach((anim, index) => {
  anim.opacity.value = withDelay(
    index * 100,
    withTiming(1, { duration: 300 })
  );
  anim.translateY.value = withDelay(
    index * 100,
    withTiming(0, { duration: 300 })
  );
});
```

### 3. Modal Transitions
```typescript
const modalScale = useSharedValue(0.8);
const modalOpacity = useSharedValue(0);

const showModal = () => {
  modalScale.value = withSpring(1);
  modalOpacity.value = withTiming(1);
};
```

## 🔍 Debugging Tips

### 1. Performance Monitoring
```typescript
// Enable layout animations in development
if (__DEV__) {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}
```

### 2. Animation Inspector
Use React DevTools to inspect component re-renders and identify performance bottlenecks.

### 3. Frame Rate Monitoring
Test animations on physical devices and monitor frame rates using developer tools.

## 🚀 Advanced Techniques

### 1. Gesture Integration
```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan()
  .onChange((event) => {
    translateX.value = event.translationX;
  });
```

### 2. Layout Animations
```typescript
// For layout changes
LayoutAnimation.configureNext({
  duration: 300,
  create: { type: 'easeInEaseOut', property: 'opacity' },
  update: { type: 'easeInEaseOut', property: 'opacity' },
});
```

### 3. Shared Element Transitions
For advanced navigation transitions between screens.

This implementation provides a solid foundation for smooth, performant animations in your React Native app with react-native-reanimated.