// components/ui/AnimatedButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface AnimatedButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  gradient?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  variant = 'primary',
  size = 'medium',
  icon,
  style,
  textStyle,
  disabled = false,
  gradient = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, theme.animations.spring.snappy);
    opacity.value = withTiming(0.8, { duration: theme.animations.timing.fast });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.animations.spring.gentle);
    opacity.value = withTiming(1, { duration: theme.animations.timing.fast });
  };

  const handlePress = () => {
    scale.value = withSpring(0.9, theme.animations.spring.bouncy, () => {
      scale.value = withSpring(1, theme.animations.spring.gentle);
      runOnJS(onPress)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getButtonStyles = () => {
    const baseStyles = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: theme.borderRadius.medium,
      ...theme.shadows.small,
    };

    const sizeStyles = {
      small: {
        paddingVertical: theme.spacing.small,
        paddingHorizontal: theme.spacing.medium,
        minHeight: 36,
      },
      medium: {
        paddingVertical: theme.spacing.medium,
        paddingHorizontal: theme.spacing.large,
        minHeight: 48,
      },
      large: {
        paddingVertical: theme.spacing.large,
        paddingHorizontal: theme.spacing.xlarge,
        minHeight: 56,
      },
    };

    const variantStyles = {
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
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: theme.colors.danger,
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || isLoading ? 0.6 : 1,
    };
  };

  const getTextStyles = () => {
    const baseTextStyles = {
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    };

    const sizeTextStyles = {
      small: { fontSize: theme.typography.fontSize.small },
      medium: { fontSize: theme.typography.fontSize.body },
      large: { fontSize: theme.typography.fontSize.large },
    };

    const variantTextStyles = {
      primary: { color: theme.colors.text.white },
      secondary: { color: theme.colors.text.white },
      outline: { color: theme.colors.primary },
      ghost: { color: theme.colors.primary },
      danger: { color: theme.colors.text.white },
    };

    return {
      ...baseTextStyles,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const buttonStyles = getButtonStyles();
  const finalTextStyles = { ...getTextStyles(), ...textStyle };

  if (gradient && (variant === 'primary' || variant === 'secondary' || variant === 'danger')) {
    const gradientColors = variant === 'primary' 
      ? theme.colors.background.gradient.primary
      : variant === 'secondary'
      ? theme.colors.background.gradient.secondary
      : theme.colors.background.gradient.danger;

    return (
      <AnimatedTouchableOpacity
        style={[animatedStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={1}
      >
        <AnimatedLinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonStyles, { backgroundColor: 'transparent' }]}
        >
          {isLoading ? (
            <ActivityIndicator color={finalTextStyles.color} size="small" />
          ) : (
            <>
              {icon && <Animated.View style={{ marginRight: icon ? theme.spacing.small : 0 }}>{icon}</Animated.View>}
              <Text style={finalTextStyles}>{title}</Text>
            </>
          )}
        </AnimatedLinearGradient>
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity
      style={[animatedStyle, buttonStyles, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={1}
    >
      {isLoading ? (
        <ActivityIndicator color={finalTextStyles.color} size="small" />
      ) : (
        <>
          {icon && <Animated.View style={{ marginRight: icon ? theme.spacing.small : 0 }}>{icon}</Animated.View>}
          <Text style={finalTextStyles}>{title}</Text>
        </>
      )}
    </AnimatedTouchableOpacity>
  );
};