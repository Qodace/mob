// components/ui/AnimatedInput.tsx
import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../../theme';

interface AnimatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);

  React.useEffect(() => {
    focusAnimation.value = withTiming(isFocused ? 1 : 0, {
      duration: theme.animations.timing.medium,
    });
  }, [isFocused]);

  React.useEffect(() => {
    errorAnimation.value = withTiming(error ? 1 : 0, {
      duration: theme.animations.timing.medium,
    });
  }, [error]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusAnimation.value,
      [0, 1],
      [error ? theme.colors.danger : theme.colors.border.light, theme.colors.primary]
    ),
    borderWidth: focusAnimation.value === 1 ? 2 : 1,
    shadowOpacity: focusAnimation.value * 0.1,
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      focusAnimation.value,
      [0, 1],
      [theme.colors.text.tertiary, theme.colors.primary]
    ),
    transform: [
      {
        scale: interpolateColor(
          focusAnimation.value,
          [0, 1],
          [1, 0.85]
        ) as any,
      },
    ],
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorAnimation.value,
    transform: [
      {
        translateY: errorAnimation.value * -5,
      },
    ],
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={{ marginBottom: theme.spacing.medium }}>
      {label && (
        <Animated.Text style={[styles.label, labelAnimatedStyle]}>
          {label}
        </Animated.Text>
      )}
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon && { paddingLeft: theme.spacing.xlarge },
            rightIcon && { paddingRight: theme.spacing.xlarge },
            style,
          ]}
          placeholderTextColor={theme.colors.text.quaternary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </Animated.View>
      {error && (
        <Animated.Text style={[styles.errorText, errorAnimatedStyle]}>
          {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = {
  label: {
    fontSize: theme.typography.fontSize.small,
    fontWeight: '500' as const,
    marginBottom: theme.spacing.xsmall,
    color: theme.colors.text.secondary,
  },
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.small,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    minHeight: 48,
  },
  iconContainer: {
    position: 'absolute' as const,
    left: theme.spacing.medium,
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute' as const,
    right: theme.spacing.medium,
    zIndex: 1,
  },
  errorText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.danger,
    marginTop: theme.spacing.xsmall,
    marginLeft: theme.spacing.small,
  },
};