import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AnimatedButton from '../../components/common/AnimatedButton';
import AnimatedHeart from '../../components/common/AnimatedHeart';
import { Card } from '../../components';
import theme from '../../theme';

const AnimationDemoScreen: React.FC = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [buttonPressCount, setButtonPressCount] = useState(0);

  const handleHeartPress = () => {
    setIsLiked(!isLiked);
    Alert.alert('Heart Animation', `Post ${!isLiked ? 'liked' : 'unliked'}!`);
  };

  const handleButtonPress = () => {
    setButtonPressCount(prev => prev + 1);
    Alert.alert('Button Animation', `Button pressed ${buttonPressCount + 1} times!`);
  };

  const handleLongPress = () => {
    Alert.alert('Long Press', 'Button long pressed with animation!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Animation Demo</Text>
        <Text style={styles.subtitle}>Smooth animations using react-native-reanimated</Text>
      </View>

      {/* Heart Animation Demo */}
      <Card style={styles.demoCard}>
        <Text style={styles.sectionTitle}>Heart Animation</Text>
        <Text style={styles.description}>
          Tap the heart to see the like animation with scale, rotation, and bounce effects.
        </Text>
        
        <View style={styles.animationContainer}>
          <AnimatedHeart
            isLiked={isLiked}
            onPress={handleHeartPress}
            size={48}
            color={theme.colors.danger}
          />
        </View>
        
        <Text style={styles.status}>
          Status: {isLiked ? 'Liked ❤️' : 'Not liked 💔'}
        </Text>
      </Card>

      {/* Button Animations Demo */}
      <Card style={styles.demoCard}>
        <Text style={styles.sectionTitle}>Button Animations</Text>
        <Text style={styles.description}>
          Press buttons to see smooth scale and opacity animations.
        </Text>
        
        <View style={styles.buttonsContainer}>
          <AnimatedButton
            title="Primary Button"
            onPress={handleButtonPress}
            variant="primary"
            style={styles.button}
          />
          
          <AnimatedButton
            title="Secondary Button"
            onPress={handleButtonPress}
            variant="secondary"
            style={styles.button}
          />
          
          <AnimatedButton
            title="Outline Button"
            onPress={handleButtonPress}
            variant="outline"
            style={styles.button}
          />
          
          <AnimatedButton
            title="Disabled Button"
            onPress={handleButtonPress}
            disabled={true}
            style={styles.button}
          />
        </View>
        
        <Text style={styles.counter}>
          Button presses: {buttonPressCount}
        </Text>
      </Card>

      {/* Animation Showcase */}
      <Card style={styles.demoCard}>
        <Text style={styles.sectionTitle}>Animation Features</Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>✨</Text>
            <Text style={styles.featureText}>Smooth spring animations</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <Text style={styles.featureText}>60 FPS performance</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>⚡</Text>
            <Text style={styles.featureText}>Native-driven animations</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🎨</Text>
            <Text style={styles.featureText}>Customizable easing</Text>
          </View>
        </View>
      </Card>

      {/* Performance Info */}
      <Card style={styles.demoCard}>
        <Text style={styles.sectionTitle}>Performance Tips</Text>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tip}>• Use useSharedValue for animation values</Text>
          <Text style={styles.tip}>• Prefer withSpring over withTiming for natural feel</Text>
          <Text style={styles.tip}>• Use useAnimatedStyle for transforms</Text>
          <Text style={styles.tip}>• Avoid heavy work in animation callbacks</Text>
          <Text style={styles.tip}>• Test on real devices for accurate performance</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  demoCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  status: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
  counter: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  featuresContainer: {
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  featureText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.dark,
    flex: 1,
  },
  tipsContainer: {
    gap: theme.spacing.sm,
  },
  tip: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.gray[700],
    lineHeight: 18,
  },
});

export default AnimationDemoScreen;