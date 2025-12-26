import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EventCard from '../../components/EventCard';
import { Colors } from '../../constants/Colors';
import { apis } from '../../lib/api';
import { EventOut } from '@team-up-main/api-client';

type FilterCategory = 'all' | 'sports' | 'social' | 'fitness' | 'outdoor';

export default function EventsScreen() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [events, setEvents] = useState<EventOut[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setError(null);
      const data = await apis.events.listEvents({ status: 'open', limit: 50});
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events. Pull to refresh.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEvents();
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      await loadEvents();
      return;
    }

    setIsSearching(true);
    try {
      setError(null);
      const data = await apis.events.searchEvents({ keyword, limit: 50 });
      setEvents(data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = async () => {
    setKeyword('');
    await loadEvents();
  };

  const filterCategories: { key: FilterCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'grid-outline' },
    { key: 'sports', label: 'Sports', icon: 'basketball-outline' },
    { key: 'social', label: 'Social', icon: 'people-outline' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness-outline' },
    { key: 'outdoor', label: 'Outdoor', icon: 'leaf-outline' },
  ];

  const handleFilterPress = (filter: FilterCategory) => {
    setSelectedFilter(filter);
    // Note: Filter logic would be implemented here in functional code
    // For now, this is purely visual styling
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Modern Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
          <Ionicons name="search" size={20} color={Colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={Colors.gray[400]}
            value={keyword}
            onChangeText={setKeyword}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {keyword ? (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          ) : null}
          {isSearching && (
            <ActivityIndicator size="small" color={Colors.primary[600]} style={styles.searchLoader} />
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filterCategories.map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => handleFilterPress(category.key)}
              activeOpacity={0.7}
              style={[
                styles.filterChip,
                selectedFilter === category.key && styles.filterChipActive,
              ]}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={selectedFilter === category.key ? Colors.white : Colors.gray[600]}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === category.key && styles.filterChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={Colors.primary[600]} />
            <Text style={styles.loadingText}>Finding amazing events...</Text>
            <Text style={styles.loadingSubtext}>Just a moment</Text>
          </View>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={64} color={Colors.error[500]} />
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity onPress={loadEvents} style={styles.retryButton}>
            <LinearGradient
              colors={[Colors.primary[600], Colors.primary[700]]}
              style={styles.retryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="refresh" size={20} color={Colors.white} />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={[Colors.primary[100], Colors.primary[200]]}
              style={styles.emptyIconGradient}
            >
              <Ionicons name="calendar-outline" size={48} color={Colors.primary[600]} />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>No Events Found</Text>
          <Text style={styles.emptySubtitle}>
            {keyword
              ? 'Try adjusting your search terms or filters'
              : 'Be the first to create an event and start connecting!'}
          </Text>
          {!keyword && (
            <TouchableOpacity style={styles.createEventButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.primary[600], Colors.primary[700]]}
                style={styles.createEventGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={22} color={Colors.white} />
                <Text style={styles.createEventText}>Create Event</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary[600]}
              colors={[Colors.primary[600]]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[900],
  },
  // Modern Header Styles
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    gap: 16,
  },
  headerTop: {
    gap: 6,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  // Search Section Styles
  searchSection: {
    backgroundColor: Colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[800],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[800],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    backgroundColor: Colors.gray[800],
    borderColor: Colors.primary[600],
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchLoader: {
    marginLeft: 8,
  },
  // Filter Chips Styles
  filterContainer: {
    gap: 10,
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray[800],
    borderWidth: 1.5,
    borderColor: Colors.gray[700],
  },
  filterChipActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[300],
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  // List Styles
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.gray[400],
  },
  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.error[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
  },
  errorSubtitle: {
    fontSize: 15,
    color: Colors.gray[400],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  retryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    minWidth: 160,
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.gray[400],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  createEventButton: {
    borderRadius: 14,
    overflow: 'hidden',
    minWidth: 180,
  },
  createEventGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  createEventText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
