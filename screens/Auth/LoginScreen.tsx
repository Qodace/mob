import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { AnimatedInput } from '../../components/ui/AnimatedInput';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';
import { theme } from '../../theme';

const { height, width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();

  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Logo animation
    logoOpacity.value = withTiming(1, { duration: theme.animations.timing.slow });
    logoScale.value = withSpring(1, theme.animations.spring.bouncy);

    // Form animation with delay
    setTimeout(() => {
      formOpacity.value = withTiming(1, { duration: theme.animations.timing.medium });
      formTranslateY.value = withSpring(0, theme.animations.spring.gentle);
    }, 300);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login({ email, password });
    } catch (error: any) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const shakeAnimation = () => {
    formTranslateY.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  };

  React.useEffect(() => {
    if (errorMessage) {
      shakeAnimation();
    }
  }, [errorMessage]);

  return (
    <LinearGradient
      colors={theme.colors.background.gradient.primary}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Animated Logo Section */}
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]} entering={FadeIn.delay(200)}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[theme.colors.text.white, theme.colors.primaryLight]}
                style={styles.logoGradient}
              >
                <Ionicons name="home" size={40} color={theme.colors.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>RealEstate CRM</Text>
            <Text style={styles.tagline}>Your Gateway to Property Success</Text>
          </Animated.View>

          {/* Animated Form Section */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]} entering={SlideInUp.delay(400)}>
            <View style={styles.card}>
              <Text style={styles.welcomeTitle}>Welcome Back!</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>

              {errorMessage && (
                <Animated.View style={styles.errorContainer} entering={SlideInDown}>
                  <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Animated.View>
              )}

              <View style={styles.inputContainer}>
                <AnimatedInput
                  label="Email Address"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  icon={<Ionicons name="mail-outline" size={20} color={theme.colors.text.tertiary} />}
                  error={errorMessage && !email ? 'Email is required' : undefined}
                />

                <AnimatedInput
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.tertiary} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  }
                  error={errorMessage && !password ? 'Password is required' : undefined}
                />
              </View>

              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <AnimatedButton
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                gradient={true}
                size="large"
                style={styles.loginButton}
                icon={<Ionicons name="log-in-outline" size={20} color={theme.colors.text.white} />}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <AnimatedButton
                title="Continue with Google"
                onPress={() => Alert.alert('Google Login', 'Coming Soon!')}
                variant="outline"
                size="large"
                icon={<Ionicons name="logo-google" size={20} color={theme.colors.primary} />}
                style={styles.socialButton}
              />
            </View>
          </Animated.View>

          {/* Animated Footer */}
          <Animated.View style={styles.footer} entering={FadeIn.delay(600)}>
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={styles.registerLinkText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.large,
    paddingTop: theme.spacing.xxlarge * 2,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxlarge,
  },
  logoContainer: {
    marginBottom: theme.spacing.large,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  appName: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  tagline: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xlarge,
    ...theme.shadows.large,
  },
  welcomeTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xlarge,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerLight + '20',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.small,
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  inputContainer: {
    marginBottom: theme.spacing.large,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xlarge,
  },
  forgotPasswordText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: theme.spacing.xlarge,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xlarge,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  dividerText: {
    marginHorizontal: theme.spacing.medium,
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.small,
    fontWeight: '500',
  },
  socialButton: {
    borderColor: theme.colors.border.medium,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge,
  },
  registerLink: {
    padding: theme.spacing.medium,
  },
  registerText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.white,
    opacity: 0.9,
  },
  registerLinkText: {
    color: theme.colors.text.white,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;