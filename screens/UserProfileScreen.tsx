import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types/auth';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { Card } from '../components/ui/Card';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Checkbox } from '../components/ui/Checkbox';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const UserProfileScreen = () => {
  const { user, logout, updateProfile, changePassword, connectGoogleAccount, disconnectGoogleAccount, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSection, setActiveSection] = React.useState<'profile' | 'preferences' | 'security' | 'integrations'>('profile');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: theme.animations.timing.medium });
    contentOpacity.value = withTiming(1, { duration: theme.animations.timing.medium });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Profile Update State
  const [profileFormData, setProfileFormData] = React.useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    preferences: user?.preferences || {
      theme: 'system',
      notifications: { email: true, push: true, leadUpdates: true, taskReminders: true },
      dashboard: { defaultView: 'leads', leadsPerPage: 10 },
    },
  });

  // Password Change State
  const [passwordFormData, setPasswordFormData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = React.useState(false);

  const [profileChangesMade, setProfileChangesMade] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    const hasChanges =
      profileFormData.name !== user.name ||
      profileFormData.phone !== user.phone ||
      profileFormData.department !== user.department ||
      profileFormData.preferences?.theme !== user.preferences.theme ||
      profileFormData.preferences?.notifications?.email !== user.preferences.notifications.email ||
      profileFormData.preferences?.notifications?.push !== user.preferences.notifications.push ||
      profileFormData.preferences?.notifications?.leadUpdates !== user.preferences.notifications.leadUpdates ||
      profileFormData.preferences?.notifications?.taskReminders !== user.preferences.notifications.taskReminders ||
      profileFormData.preferences?.dashboard?.defaultView !== user.preferences.dashboard.defaultView ||
      profileFormData.preferences?.dashboard?.leadsPerPage !== user.preferences.dashboard.leadsPerPage;

    setProfileChangesMade(hasChanges);
  }, [profileFormData, user]);

  const handleProfileChange = (name: keyof Partial<User>, value: string) => {
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (category: 'theme' | 'notifications' | 'dashboard', key: string, value: any) => {
    setProfileFormData(prev => {
      const currentPreferences = prev.preferences || {
        theme: 'system',
        notifications: { email: true, push: true, leadUpdates: true, taskReminders: true },
        dashboard: { defaultView: 'leads', leadsPerPage: 10 },
      };

      let updatedPreferences = { ...currentPreferences };

      if (category === 'theme') {
        updatedPreferences.theme = value;
      } else {
        const currentCategoryPreferences = (currentPreferences as any)[category] || {};
        updatedPreferences = {
          ...updatedPreferences,
          [category]: {
            ...currentCategoryPreferences,
            [key]: value,
          },
        };
      }

      return {
        ...prev,
        preferences: updatedPreferences,
      };
    });
  };

  const handlePasswordChange = (name: keyof typeof passwordFormData, value: string) => {
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async () => {
    setIsSubmitting(true);
    setProfileMessage(null);
    try {
      if (user) {
        await updateProfile(profileFormData);
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        await refreshUser();
      }
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    setIsSubmitting(true);
    setPasswordMessage(null);
    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsSubmitting(false);
      return;
    }
    if (passwordFormData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setIsSubmitting(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionButton = ({ section, title, icon }: { section: typeof activeSection; title: string; icon: string }) => {
    const isActive = activeSection === section;
    return (
      <TouchableOpacity
        onPress={() => setActiveSection(section)}
        style={[styles.sectionButton, isActive && styles.activeSectionButton]}
      >
        <Ionicons name={icon as any} size={20} color={isActive ? theme.colors.text.white : theme.colors.text.secondary} />
        <Text style={[styles.sectionButtonText, isActive && styles.activeSectionButtonText]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const MessageBox = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
    <Animated.View
      entering={SlideInDown}
      style={[
        styles.messageBox,
        type === 'error' ? styles.errorBox : styles.successBox,
      ]}
    >
      <Ionicons
        name={type === 'error' ? 'alert-circle' : 'checkmark-circle'}
        size={20}
        color={type === 'error' ? theme.colors.danger : theme.colors.success}
      />
      <Text style={[styles.messageText, { color: type === 'error' ? theme.colors.danger : theme.colors.success }]}>
        {message}
      </Text>
    </Animated.View>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <LinearGradient
          colors={theme.colors.background.gradient.primary}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[theme.colors.text.white, theme.colors.primaryLight]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Section Navigation */}
      <Animated.View style={styles.sectionNavigation} entering={FadeIn.delay(300)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionButtons}>
          <SectionButton section="profile" title="Profile" icon="person-outline" />
          <SectionButton section="preferences" title="Preferences" icon="settings-outline" />
          <SectionButton section="security" title="Security" icon="shield-outline" />
          <SectionButton section="integrations" title="Integrations" icon="link-outline" />
        </ScrollView>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <Animated.View entering={SlideInUp}>
              {profileMessage && <MessageBox message={profileMessage.text} type={profileMessage.type} />}
              
              <Card variant="elevated" style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <AnimatedInput
                  label="Full Name"
                  value={profileFormData.name}
                  onChangeText={(text) => handleProfileChange('name', text)}
                  placeholder="Your full name"
                  icon={<Ionicons name="person-outline" size={20} color={theme.colors.text.tertiary} />}
                />

                <AnimatedInput
                  label="Email Address"
                  value={profileFormData.email}
                  placeholder="Your email address"
                  editable={false}
                  icon={<Ionicons name="mail-outline" size={20} color={theme.colors.text.tertiary} />}
                />

                <AnimatedInput
                  label="Phone Number"
                  value={profileFormData.phone}
                  onChangeText={(text) => handleProfileChange('phone', text)}
                  placeholder="Your phone number"
                  keyboardType="phone-pad"
                  icon={<Ionicons name="call-outline" size={20} color={theme.colors.text.tertiary} />}
                />

                <AnimatedInput
                  label="Department"
                  value={profileFormData.department}
                  onChangeText={(text) => handleProfileChange('department', text)}
                  placeholder="Your department"
                  icon={<Ionicons name="business-outline" size={20} color={theme.colors.text.tertiary} />}
                />

                <AnimatedButton
                  title="Update Profile"
                  onPress={handleProfileUpdate}
                  isLoading={isSubmitting}
                  disabled={!profileChangesMade}
                  gradient={true}
                  style={styles.updateButton}
                />
              </Card>
            </Animated.View>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <Animated.View entering={SlideInUp}>
              <Card variant="elevated" style={styles.section}>
                <Text style={styles.sectionTitle}>App Preferences</Text>
                
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceLabel}>Theme</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={profileFormData.preferences?.theme || 'system'}
                      onValueChange={(itemValue) => handlePreferenceChange('theme', 'theme', itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="System Default" value="system" />
                      <Picker.Item label="Light" value="light" />
                      <Picker.Item label="Dark" value="dark" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceLabel}>Notifications</Text>
                  <View style={styles.checkboxGroup}>
                    <Checkbox
                      label="Email Notifications"
                      value={profileFormData.preferences?.notifications?.email || false}
                      onValueChange={(newValue) => handlePreferenceChange('notifications', 'email', newValue)}
                    />
                    <Checkbox
                      label="Push Notifications"
                      value={profileFormData.preferences?.notifications?.push || false}
                      onValueChange={(newValue) => handlePreferenceChange('notifications', 'push', newValue)}
                    />
                    <Checkbox
                      label="Lead Updates"
                      value={profileFormData.preferences?.notifications?.leadUpdates || false}
                      onValueChange={(newValue) => handlePreferenceChange('notifications', 'leadUpdates', newValue)}
                    />
                    <Checkbox
                      label="Task Reminders"
                      value={profileFormData.preferences?.notifications?.taskReminders || false}
                      onValueChange={(newValue) => handlePreferenceChange('notifications', 'taskReminders', newValue)}
                    />
                  </View>
                </View>

                <AnimatedButton
                  title="Save Preferences"
                  onPress={handleProfileUpdate}
                  isLoading={isSubmitting}
                  disabled={!profileChangesMade}
                  gradient={true}
                  style={styles.updateButton}
                />
              </Card>
            </Animated.View>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <Animated.View entering={SlideInUp}>
              {passwordMessage && <MessageBox message={passwordMessage.text} type={passwordMessage.type} />}
              
              <Card variant="elevated" style={styles.section}>
                <Text style={styles.sectionTitle}>Change Password</Text>
                
                <AnimatedInput
                  label="Current Password"
                  value={passwordFormData.currentPassword}
                  onChangeText={(text) => handlePasswordChange('currentPassword', text)}
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrentPassword}
                  icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.tertiary} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                      <Ionicons
                        name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  }
                />

                <AnimatedInput
                  label="New Password"
                  value={passwordFormData.newPassword}
                  onChangeText={(text) => handlePasswordChange('newPassword', text)}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  icon={<Ionicons name="key-outline" size={20} color={theme.colors.text.tertiary} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                      <Ionicons
                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  }
                />

                <AnimatedInput
                  label="Confirm New Password"
                  value={passwordFormData.confirmNewPassword}
                  onChangeText={(text) => handlePasswordChange('confirmNewPassword', text)}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmNewPassword}
                  icon={<Ionicons name="checkmark-outline" size={20} color={theme.colors.text.tertiary} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                      <Ionicons
                        name={showConfirmNewPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  }
                />

                <AnimatedButton
                  title="Change Password"
                  onPress={handleChangePassword}
                  isLoading={isSubmitting}
                  disabled={!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmNewPassword}
                  gradient={true}
                  style={styles.updateButton}
                />
              </Card>
            </Animated.View>
          )}

          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <Animated.View entering={SlideInUp}>
              <Card variant="elevated" style={styles.section}>
                <Text style={styles.sectionTitle}>Google Integration</Text>
                
                <View style={styles.integrationItem}>
                  <View style={styles.integrationInfo}>
                    <Ionicons name="logo-google" size={24} color="#4285F4" />
                    <View style={styles.integrationDetails}>
                      <Text style={styles.integrationTitle}>Google Account</Text>
                      <Text style={styles.integrationStatus}>
                        {user?.googleAccount?.isConnected ? 'Connected' : 'Not Connected'}
                      </Text>
                    </View>
                  </View>
                  
                  <AnimatedButton
                    title={user?.googleAccount?.isConnected ? 'Disconnect' : 'Connect'}
                    onPress={user?.googleAccount?.isConnected ? disconnectGoogleAccount : connectGoogleAccount}
                    variant={user?.googleAccount?.isConnected ? 'outline' : 'primary'}
                    size="small"
                  />
                </View>
              </Card>
            </Animated.View>
          )}

          {/* Logout Button */}
          <Card variant="outlined" style={styles.logoutSection}>
            <AnimatedButton
              title="Sign Out"
              onPress={logout}
              variant="danger"
              gradient={true}
              icon={<Ionicons name="log-out-outline" size={20} color={theme.colors.text.white} />}
              style={styles.logoutButton}
            />
          </Card>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
  },
  header: {
    marginBottom: theme.spacing.medium,
  },
  headerGradient: {
    paddingTop: theme.spacing.large,
    paddingBottom: theme.spacing.xlarge,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
  },
  avatarContainer: {
    marginRight: theme.spacing.large,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    marginBottom: theme.spacing.xsmall,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.white,
    opacity: 0.9,
    marginBottom: theme.spacing.small,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.borderRadius.small,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.white,
    fontWeight: '600',
  },
  sectionNavigation: {
    marginBottom: theme.spacing.large,
  },
  sectionButtons: {
    paddingHorizontal: theme.spacing.large,
    gap: theme.spacing.small,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.xsmall,
  },
  activeSectionButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sectionButtonText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  activeSectionButtonText: {
    color: theme.colors.text.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.xxlarge,
  },
  section: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.large,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
    gap: theme.spacing.small,
  },
  errorBox: {
    backgroundColor: theme.colors.dangerLight + '20',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
  },
  successBox: {
    backgroundColor: theme.colors.successLight + '20',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  messageText: {
    fontSize: theme.typography.fontSize.small,
    flex: 1,
  },
  preferenceGroup: {
    marginBottom: theme.spacing.large,
  },
  preferenceLabel: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.small,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.small,
  },
  picker: {
    height: 50,
  },
  checkboxGroup: {
    gap: theme.spacing.small,
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.medium,
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.medium,
  },
  integrationDetails: {
    flex: 1,
  },
  integrationTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xsmall,
  },
  integrationStatus: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.tertiary,
  },
  updateButton: {
    marginTop: theme.spacing.medium,
  },
  logoutSection: {
    marginTop: theme.spacing.large,
  },
  logoutButton: {
    width: '100%',
  },
});

export default UserProfileScreen;