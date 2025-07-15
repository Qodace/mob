import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface SplashProps {
  onFinish: () => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SplashScreenSequence: React.FC<SplashProps> = ({ onFinish }) => {
  const [currentSplash, setCurrentSplash] = useState(0);
  
  // Animation values
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.3);
  const rotateAnim = useSharedValue(0);
  const skipButtonAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);
  const textSlideAnim = useSharedValue(50);
  const iconBounceAnim = useSharedValue(0);

  const splashScreens = [
    { 
      text: 'RealEstate CRM', 
      subtitle: 'Professional Property Management',
      colors: theme.colors.background.gradient.primary,
      icon: 'home',
    },
    { 
      text: 'Connect & Convert', 
      subtitle: 'Bringing buyers and sellers together',
      colors: theme.colors.background.gradient.secondary,
      icon: 'people',
    },
    { 
      text: 'Smart Analytics', 
      subtitle: 'Data-driven real estate decisions',
      colors: [theme.colors.accent, theme.colors.accentLight],
      icon: 'analytics',
    },
  ];

  const currentScreen = splashScreens[currentSplash];

  useEffect(() => {
    // Show skip button after a short delay
    const skipButtonDelay = setTimeout(() => {
      skipButtonAnim.value = withSpring(1, theme.animations.spring.gentle);
    }, 1000);

    // Start animations
    const startAnimations = () => {
      // Icon animations
      scaleAnim.value = withSpring(1, theme.animations.spring.bouncy);
      fadeAnim.value = withTiming(1, { duration: theme.animations.timing.slow });
      rotateAnim.value = withTiming(360, { 
        duration: theme.animations.timing.verySlow,
        easing: Easing.out(Easing.quad)
      });
      
      // Text animations
      textSlideAnim.value = withSpring(0, theme.animations.spring.gentle);
      
      // Icon bounce effect
      iconBounceAnim.value = withSequence(
        withDelay(500, withSpring(1, theme.animations.spring.bouncy)),
        withDelay(1000, withSpring(0.9, theme.animations.spring.snappy)),
        withSpring(1, theme.animations.spring.gentle)
      );

      // Progress animation
      progressAnim.value = withTiming((currentSplash + 1) / splashScreens.length, {
        duration: theme.animations.timing.slow,
      });
    };

    startAnimations();

    // Auto-advance to next splash or finish
    const autoAdvanceTimeout = setTimeout(() => {
      if (currentSplash < splashScreens.length - 1) {
        // Fade out current splash
        fadeAnim.value = withTiming(0, { duration: theme.animations.timing.medium }, () => {
          runOnJS(setCurrentSplash)(currentSplash + 1);
          // Reset animations for next splash
          scaleAnim.value = 0.3;
          textSlideAnim.value = 50;
          rotateAnim.value = 0;
        });
      } else {
        // Finish splash sequence
        fadeAnim.value = withTiming(0, { duration: theme.animations.timing.medium }, () => {
          runOnJS(onFinish)();
        });
      }
    }, 3000);

    return () => {
      clearTimeout(skipButtonDelay);
      clearTimeout(autoAdvanceTimeout);
    };
  }, [currentSplash]);

  const handleSkip = () => {
    fadeAnim.value = withTiming(0, { duration: theme.animations.timing.fast }, () => {
      runOnJS(onFinish)();
    });
  };

  const handleNext = () => {
    if (currentSplash < splashScreens.length - 1) {
      fadeAnim.value = withTiming(0, { duration: theme.animations.timing.medium }, () => {
        runOnJS(setCurrentSplash)(currentSplash + 1);
        scaleAnim.value = 0.3;
        textSlideAnim.value = 50;
        rotateAnim.value = 0;
      });
    } else {
      handleSkip();
    }
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnim.value * iconBounceAnim.value },
      { rotate: `${rotateAnim.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textSlideAnim.value }],
    opacity: fadeAnim.value,
  }));

  const skipButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: skipButtonAnim.value,
    transform: [{ scale: skipButtonAnim.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  return (
    <AnimatedLinearGradient
      colors={currentScreen.colors}
      style={[StyleSheet.absoluteFillObject, styles.container, containerAnimatedStyle]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Skip Button */}
      <Animated.View style={[styles.skipButtonContainer, skipButtonAnimatedStyle]}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
          <Ionicons name="play-skip-forward" size={16} color={theme.colors.text.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <View style={styles.iconBackground}>
            <Ionicons
              name={currentScreen.icon as any}
              size={60}
              color={theme.colors.text.white}
            />
          </View>
          
          {/* Floating particles effect */}
          <View style={styles.particlesContainer}>
            {[...Array(6)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    transform: [
                      { 
                        translateX: Math.cos((index * 60) * Math.PI / 180) * 80 * scaleAnim.value 
                      },
                      { 
                        translateY: Math.sin((index * 60) * Math.PI / 180) * 80 * scaleAnim.value 
                      },
                      { scale: scaleAnim.value * 0.5 }
                    ],
                    opacity: fadeAnim.value * 0.6,
                  }
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Animated Text */}
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={styles.mainText}>{currentScreen.text}</Text>
          <Text style={styles.subtitleText}>{currentScreen.subtitle}</Text>
        </Animated.View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View style={[styles.progressBar, progressAnimatedStyle]} />
          </View>
          <View style={styles.dotsContainer}>
            {splashScreens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSplash && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.nextButtonGradient}
          >
            <Ionicons 
              name={currentSplash === splashScreens.length - 1 ? "checkmark" : "arrow-forward"} 
              size={24} 
              color={theme.colors.text.white} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(20)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.backgroundDot,
              {
                left: (index % 5) * (width / 4),
                top: Math.floor(index / 5) * (height / 4),
                opacity: fadeAnim.value * 0.1,
                transform: [{ scale: scaleAnim.value * 0.3 }],
              }
            ]}
          />
        ))}
      </View>
    </AnimatedLinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonContainer: {
    position: 'absolute',
    top: theme.spacing.xxlarge + theme.spacing.large,
    right: theme.spacing.large,
    zIndex: 10,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    ...theme.shadows.small,
  },
  skipButtonText: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.small,
    fontWeight: '600',
    marginRight: theme.spacing.xsmall,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: theme.spacing.xlarge,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxlarge,
    position: 'relative',
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.large,
  },
  particlesContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.white,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxlarge,
  },
  mainText: {
    fontSize: theme.typography.fontSize.h1 + 4,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.text.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxlarge,
  },
  progressBackground: {
    width: width * 0.6,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: theme.spacing.medium,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.text.white,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    backgroundColor: theme.colors.text.white,
    transform: [{ scale: 1.2 }],
  },
  nextButton: {
    ...theme.shadows.medium,
  },
  nextButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  backgroundDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.text.white,
  },
});

export default SplashScreenSequence;