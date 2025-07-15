import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  SlideInRight,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { Card } from '../components/ui/Card';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = React.useState<number | null>(null);

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: theme.animations.timing.medium });
    headerTranslateY.value = withSpring(0, theme.animations.spring.gentle);
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const metrics = [
    { 
      label: 'Total Leads', 
      value: '125', 
      icon: 'people-outline', 
      color: theme.colors.primary,
      gradient: theme.colors.background.gradient.primary,
      change: '+12%',
      changeType: 'positive' as const,
    },
    { 
      label: 'New Leads', 
      value: '8', 
      icon: 'person-add-outline', 
      color: theme.colors.success,
      gradient: theme.colors.background.gradient.success,
      change: '+5%',
      changeType: 'positive' as const,
    },
    { 
      label: 'Cold Leads', 
      value: '30', 
      icon: 'snow-outline', 
      color: theme.colors.secondary,
      gradient: theme.colors.background.gradient.secondary,
      change: '-3%',
      changeType: 'negative' as const,
    },
    { 
      label: 'Converted', 
      value: '15', 
      icon: 'checkmark-circle-outline', 
      color: theme.colors.accent,
      gradient: [theme.colors.accent, theme.colors.accentLight],
      change: '+8%',
      changeType: 'positive' as const,
    },
    { 
      label: 'Tasks', 
      value: '5', 
      icon: 'calendar-outline', 
      color: theme.colors.warning,
      gradient: [theme.colors.warning, theme.colors.warningLight],
      change: '0%',
      changeType: 'neutral' as const,
    },
    { 
      label: 'Revenue', 
      value: '$1.2M', 
      icon: 'cash-outline', 
      color: theme.colors.success,
      gradient: theme.colors.background.gradient.success,
      change: '+15%',
      changeType: 'positive' as const,
    },
  ];

  const recentActivities = [
    { id: 1, type: 'lead', message: 'New lead from website', time: '2 min ago', icon: 'person-add' },
    { id: 2, type: 'call', message: 'Call scheduled with John Doe', time: '15 min ago', icon: 'call' },
    { id: 3, type: 'meeting', message: 'Property viewing completed', time: '1 hour ago', icon: 'home' },
    { id: 4, type: 'deal', message: 'Deal closed - $250K', time: '2 hours ago', icon: 'trophy' },
  ];

  const MetricCard = ({ metric, index }: { metric: any; index: number }) => {
    const scale = useSharedValue(1);
    const isSelected = selectedMetric === index;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      scale.value = withSpring(0.95, theme.animations.spring.snappy, () => {
        scale.value = withSpring(1, theme.animations.spring.gentle);
      });
      setSelectedMetric(isSelected ? null : index);
    };

    return (
      <Animated.View
        style={[styles.metricCardContainer, animatedStyle]}
        entering={SlideInRight.delay(index * 100)}
        layout={Layout.springify()}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <LinearGradient
            colors={metric.gradient}
            style={[
              styles.metricCard,
              isSelected && styles.selectedMetricCard,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricHeader}>
              <View style={styles.metricIconContainer}>
                <Ionicons name={metric.icon} size={24} color={theme.colors.text.white} />
              </View>
              <View style={[
                styles.changeContainer,
                { backgroundColor: metric.changeType === 'positive' ? theme.colors.successLight + '30' : 
                  metric.changeType === 'negative' ? theme.colors.dangerLight + '30' : 
                  theme.colors.text.quaternary + '30' }
              ]}>
                <Text style={[
                  styles.changeText,
                  { color: metric.changeType === 'positive' ? theme.colors.text.white : 
                    metric.changeType === 'negative' ? theme.colors.text.white : 
                    theme.colors.text.white }
                ]}>
                  {metric.change}
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ActivityItem = ({ activity, index }: { activity: any; index: number }) => (
    <Animated.View
      entering={SlideInUp.delay(index * 100)}
      style={styles.activityItem}
    >
      <View style={[styles.activityIcon, { backgroundColor: theme.colors.primary + '20' }]}>
        <Ionicons name={activity.icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{activity.message}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Animated Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] || 'User'}! 👋
            </Text>
            <Text style={styles.subtitle}>Here's what's happening today</Text>
          </View>
          {user?.role === 'admin' && (
            <Animated.View style={styles.adminBadge} entering={FadeIn.delay(500)}>
              <Ionicons name="shield-checkmark" size={16} color={theme.colors.text.white} />
              <Text style={styles.adminText}>Admin</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Metrics Grid */}
        <Animated.View style={styles.section} entering={FadeIn.delay(300)}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Recent Activities */}
        <Animated.View style={styles.section} entering={FadeIn.delay(600)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Card variant="elevated" style={styles.activitiesCard}>
            {recentActivities.map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} index={index} />
            ))}
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={styles.section} entering={FadeIn.delay(900)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {[
              { title: 'Add Lead', icon: 'person-add', color: theme.colors.primary },
              { title: 'Schedule Call', icon: 'call', color: theme.colors.secondary },
              { title: 'View Reports', icon: 'analytics', color: theme.colors.accent },
              { title: 'Settings', icon: 'settings', color: theme.colors.warning },
            ].map((action, index) => (
              <Animated.View
                key={action.title}
                entering={SlideInUp.delay(900 + index * 100)}
                style={styles.quickActionCard}
              >
                <TouchableOpacity style={styles.quickActionButton}>
                  <LinearGradient
                    colors={[action.color, action.color + '80']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name={action.icon as any} size={24} color={theme.colors.text.white} />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxlarge,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.large,
    paddingTop: theme.spacing.large,
    paddingBottom: theme.spacing.xlarge,
  },
  greeting: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xsmall,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
  },
  adminText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.white,
    fontWeight: '600',
    marginLeft: theme.spacing.xsmall,
  },
  section: {
    marginBottom: theme.spacing.xlarge,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.medium,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: theme.spacing.xsmall,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.large,
    gap: theme.spacing.medium,
  },
  metricCardContainer: {
    width: (width - theme.spacing.large * 2 - theme.spacing.medium) / 2,
  },
  metricCard: {
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.medium,
    minHeight: 120,
  },
  selectedMetricCard: {
    transform: [{ scale: 1.02 }],
    ...theme.shadows.large,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.medium,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeContainer: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.borderRadius.small,
  },
  changeText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    marginBottom: theme.spacing.xsmall,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.white,
    opacity: 0.9,
  },
  activitiesCard: {
    marginHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.medium,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xsmall,
  },
  activityTime: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.tertiary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.large,
    gap: theme.spacing.medium,
  },
  quickActionCard: {
    width: (width - theme.spacing.large * 2 - theme.spacing.medium) / 2,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    ...theme.shadows.small,
  },
  quickActionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.medium,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DashboardScreen;