// components/ui/Card.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  pressable?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  pressable = false,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, theme.animations.spring.snappy);
      opacity.value = withTiming(0.9, { duration: theme.animations.timing.fast });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, theme.animations.spring.gentle);
      opacity.value = withTiming(1, { duration: theme.animations.timing.fast });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getCardStyles = () => {
    const baseStyles = {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
    };

    const variantStyles = {
      default: {
        ...theme.shadows.small,
      },
      elevated: {
        ...theme.shadows.medium,
      },
      outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
    };
  };

  if (pressable) {
    return (
      <Animated.View
        style={[animatedStyle, getCardStyles(), style]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
      >
        <Animated.View onTouchEnd={onPress}>
          {children}
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View style={[getCardStyles(), style]}>
      {children}
    </View>
  );
};