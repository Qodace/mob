import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView, RefreshControl, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { useLeads } from '../hooks/useLeads';
import { Lead } from '../types/lead';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { Card } from '../components/ui/Card';
import { PermissionService } from '../lib/permissions';
import { LeadsStackParamList } from '../navigation/types';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

type LeadsScreenNavigationProp = StackScreenProps<LeadsStackParamList, 'LeadsList'>['navigation'];

const LeadsScreen = () => {
  const navigation = useNavigation<LeadsScreenNavigationProp>();
  const { user } = useAuth();
  const { leads, loading, error, fetchLeads, deleteLead } = useLeads();
  const permissionService = PermissionService.getInstance();

  const [refreshing, setRefreshing] = useState(false);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new' | 'contacted' | 'qualified'>('all');

  const headerOpacity = useSharedValue(0);
  const listOpacity = useSharedValue(0);

  const canCreateLeads = permissionService.hasPermission(user, 'leads', 'create');

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: theme.animations.timing.medium });
    listOpacity.value = withTiming(1, { duration: theme.animations.timing.medium });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const listAnimatedStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeads('Lead');
    setRefreshing(false);
  }, [fetchLeads]);

  useEffect(() => {
    if (leads && user) {
      let filtered = user.role === 'admin' ? leads : leads.filter(lead => lead.assignedAgent === user.id);
      
      if (selectedFilter !== 'all') {
        filtered = filtered.filter(lead => lead.status.toLowerCase() === selectedFilter);
      }
      
      setFilteredLeads(filtered);
    } else {
      setFilteredLeads([]);
    }
  }, [leads, user, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchLeads('Lead');
    }, [fetchLeads])
  );

  const handleAddLead = () => {
    if (canCreateLeads) {
      navigation.navigate('AddEditLead', { leadId: undefined });
    } else {
      Alert.alert('Permission Denied', 'You do not have permission to create leads.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (permissionService.hasPermission(user, 'leads', 'delete')) {
      Alert.alert(
        "Delete Lead",
        "Are you sure you want to delete this lead? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                await deleteLead(id);
                Alert.alert("Success", "Lead deleted successfully!");
              } catch (err: any) {
                Alert.alert("Error", err.message || "Failed to delete lead.");
              }
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert('Permission Denied', 'You do not have permission to delete leads.');
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    const statusColors = {
      'New': theme.colors.secondary,
      'Contacted': theme.colors.primary,
      'Qualified': theme.colors.success,
      'Nurturing': theme.colors.warning,
      'Site Visit Scheduled': theme.colors.accent,
      'Site Visited': theme.colors.primaryLight,
      'Negotiation': theme.colors.warning,
      'Converted': theme.colors.success,
      'Lost': theme.colors.danger,
      'Hold': theme.colors.text.tertiary,
    };
    return statusColors[status] || theme.colors.text.tertiary;
  };

  const FilterButton = ({ filter, label }: { filter: typeof selectedFilter; label: string }) => {
    const isSelected = selectedFilter === filter;
    return (
      <TouchableOpacity
        onPress={() => setSelectedFilter(filter)}
        style={[
          styles.filterButton,
          isSelected && styles.selectedFilterButton,
        ]}
      >
        <Text style={[
          styles.filterButtonText,
          isSelected && styles.selectedFilterButtonText,
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderLeadCard = ({ item, index }: { item: Lead; index: number }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <Animated.View
        entering={SlideInRight.delay(index * 100)}
        layout={Layout.springify()}
        style={styles.leadCardContainer}
      >
        <Card pressable onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}>
          <View style={styles.leadCardHeader}>
            <View style={styles.leadInfo}>
              <Text style={styles.leadName}>{item.name}</Text>
              <View style={styles.leadMeta}>
                <Ionicons name="mail-outline" size={14} color={theme.colors.text.tertiary} />
                <Text style={styles.leadEmail}>{item.primaryEmail}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.leadDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color={theme.colors.text.tertiary} />
              <Text style={styles.detailText}>{item.primaryPhone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="globe-outline" size={16} color={theme.colors.text.tertiary} />
              <Text style={styles.detailText}>{item.source}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={theme.colors.text.tertiary} />
              <Text style={styles.detailText}>{item.assignedAgent || 'Unassigned'}</Text>
            </View>
          </View>

          <View style={styles.leadActions}>
            <View style={styles.leadScore}>
              <View style={[
                styles.scoreIndicator,
                { backgroundColor: item.leadScore === 'High' ? theme.colors.success : 
                  item.leadScore === 'Medium' ? theme.colors.warning : theme.colors.danger }
              ]} />
              <Text style={styles.scoreText}>{item.leadScore} Priority</Text>
            </View>
            
            <View style={styles.actionButtons}>
              {permissionService.hasPermission(user, 'leads', 'update') && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddEditLead', { leadId: item.id })}
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
                >
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
              {permissionService.hasPermission(user, 'leads', 'delete') && (
                <TouchableOpacity
                  onPress={() => handleDeleteLead(item.id)}
                  style={[styles.actionButton, { backgroundColor: theme.colors.danger + '20' }]}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading leads...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.danger} />
        <Text style={styles.errorText}>Error: {error}</Text>
        <AnimatedButton title="Retry" onPress={() => fetchLeads('Lead')} />
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
            <View>
              <Text style={styles.headerTitle}>All Leads</Text>
              <Text style={styles.headerSubtitle}>{filteredLeads.length} leads found</Text>
            </View>
            {canCreateLeads && (
              <TouchableOpacity onPress={handleAddLead} style={styles.addButton}>
                <LinearGradient
                  colors={[theme.colors.text.white, theme.colors.background.secondary]}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="add" size={24} color={theme.colors.primary} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Filter Buttons */}
      <Animated.View style={styles.filterContainer} entering={FadeIn.delay(300)}>
        <FilterButton filter="all" label="All" />
        <FilterButton filter="new" label="New" />
        <FilterButton filter="contacted" label="Contacted" />
        <FilterButton filter="qualified" label="Qualified" />
      </Animated.View>

      {/* Leads List */}
      <Animated.View style={[styles.listContainer, listAnimatedStyle]}>
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-circle-outline" size={80} color={theme.colors.text.quaternary} />
            <Text style={styles.emptyStateTitle}>No leads found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all' 
                ? "Start by adding your first lead!" 
                : `No ${selectedFilter} leads at the moment.`}
            </Text>
            {canCreateLeads && selectedFilter === 'all' && (
              <AnimatedButton 
                title="Add New Lead" 
                onPress={handleAddLead} 
                gradient={true}
                style={styles.emptyStateButton}
              />
            )}
          </View>
        ) : (
          <FlatList
            data={filteredLeads}
            keyExtractor={(item) => item.id}
            renderItem={renderLeadCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    marginBottom: theme.spacing.xsmall,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.white,
    opacity: 0.9,
  },
  addButton: {
    ...theme.shadows.medium,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
    gap: theme.spacing.small,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectedFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  selectedFilterButtonText: {
    color: theme.colors.text.white,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.xxlarge,
  },
  leadCardContainer: {
    marginBottom: theme.spacing.medium,
  },
  leadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.medium,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xsmall,
  },
  leadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xsmall,
  },
  leadEmail: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.tertiary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.borderRadius.small,
  },
  statusText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: '600',
  },
  leadDetails: {
    marginBottom: theme.spacing.medium,
    gap: theme.spacing.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.small,
  },
  detailText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
  },
  leadActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  leadScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xsmall,
  },
  scoreIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.large,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.danger,
    marginVertical: theme.spacing.medium,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xlarge,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.small,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.xlarge,
    lineHeight: 24,
  },
  emptyStateButton: {
    minWidth: 200,
  },
});

export default LeadsScreen;