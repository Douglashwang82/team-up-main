import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Modal, Keyboard, Dimensions, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate, Extrapolate, SharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import EventCard from '../../components/EventCard';
import { Colors } from '../../constants/Colors';
import { apis } from '../../lib/api';
import { EventOut } from '@team-up-main/api-client';
import LiquidSearchBar from '../../components/LiquidSearchBar';
import GridBackground from '../../components/GridBackground';
import WarmBubbleBackground from '../../components/WarmBubbleBackground';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SEARCH_SECTION_HEIGHT = 70; // Height of the search section (no chips)

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
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // Separate input for modal
  const searchInputRef = useRef<TextInput>(null);

  // Scroll animation state - using Reanimated for high performance
  const scrollY = useSharedValue(0);

  // Scroll handler for Reanimated
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animation using Reanimated
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SEARCH_SECTION_HEIGHT],
      [0, -SEARCH_SECTION_HEIGHT],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });


  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setError(null);
      const data = await apis.events.listEvents({ status: 'open', limit: 50 });
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
  };

  // Open search modal
  const openSearchModal = () => {
    setSearchModalVisible(true);
    setSearchInput(keyword);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Close search modal
  const closeSearchModal = () => {
    setSearchModalVisible(false);
    Keyboard.dismiss();
  };

  // Apply search from modal
  const applySearch = async (searchTerm: string) => {
    setKeyword(searchTerm);
    closeSearchModal();
    if (searchTerm.trim()) {
      setIsSearching(true);
      try {
        const data = await apis.events.searchEvents({ keyword: searchTerm, limit: 50 });
        setEvents(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      await loadEvents();
    }
  };

  // Filter suggestions based on search input
  const filteredSuggestions = useMemo(() => {
    if (!searchInput.trim()) return events.slice(0, 10);
    const lowerInput = searchInput.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(lowerInput) ||
      event.owner?.displayName?.toLowerCase().includes(lowerInput)
    ).slice(0, 10);
  }, [searchInput, events]);



  return (
    <View style={styles.container}>
      {/* Warm Bubble Background - Animated Gradient Bubbles */}
      <WarmBubbleBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Animated Search Bar Section */}
        <Animated.View
          style={[
            styles.searchSection,
            headerAnimatedStyle
          ]}
        >
          {/* Search Bar - Liquid Glass Effect */}
          <View style={{ alignItems: 'center' }}>
            <LiquidSearchBar
              value={searchInput}
              onChangeText={(text) => {
                setSearchInput(text);
                if (!searchModalVisible) setSearchModalVisible(true);
              }}
              onFocus={() => setSearchModalVisible(true)}
              onSubmitEditing={() => applySearch(searchInput)}
              onClear={() => { setSearchInput(''); setKeyword(''); loadEvents(); }}
              onCancel={closeSearchModal}
              isFocused={searchModalVisible}
              inputRef={searchInputRef}
            />
          </View>
        </Animated.View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={Colors.primary} />
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
                colors={Colors.gradients.warmTech as [string, string]}
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
                colors={[Colors.base, Colors.cardbase] as [string, string]}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
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
                  colors={Colors.gradients.warmTech as [string, string]}
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
          <Animated.FlatList
            style={{ flex: 1 }}
            data={events}
            renderItem={({ item, index }) => (
              <EventCard
                event={item}
                index={index}
                scrollY={scrollY}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            pagingEnabled={false}
            snapToInterval={SCREEN_HEIGHT * 0.7 + 32}
            snapToAlignment="start"
            decelerationRate="fast"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.white}
                colors={[Colors.white]}
              />
            }
          />
        )}

        {/* Suggestions Overlay - Slides from right */}
        {searchModalVisible && (
          <Animated.View style={styles.suggestionsOverlay}>
            {/* Suggestions List */}
            <FlatList
              data={filteredSuggestions}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.suggestionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => applySearch(item.title)}
                >
                  <Ionicons name="time-outline" size={20} color={Colors.gray[400]} />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                      {item.owner?.displayName || '匿名用戶'}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={Colors.gray[300]} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.noSuggestions}>
                  <Ionicons name="search-outline" size={48} color={Colors.gray[300]} />
                  <Text style={styles.noSuggestionsText}>開始輸入以搜尋活動</Text>
                </View>
              }
            />
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Search Section Styles
  searchSection: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: SEARCH_SECTION_HEIGHT,
    zIndex: 100,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  searchGlassContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    // Glass shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchGradientBorder: {
    borderRadius: 18,
    padding: 2,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardbase, // Translucent white
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
  },
  searchContainerFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // More opaque when focused
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray[700], // Dark text for glass effect
    padding: 0,
  },
  searchInputFocused: {
    color: Colors.gray[900],
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchLoader: {
    marginLeft: 8,
  },
  suggestionsOverlay: {
    position: 'absolute',
    top: SEARCH_SECTION_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(254, 242, 222, 0.95)', // Semi-transparent to show gradient
    zIndex: 99,
  },
  // Filter Chips Styles
  filterContainer: {
    gap: 6, // Reduced gap
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Smaller gap
    paddingHorizontal: 10, // Reduced from 16
    paddingVertical: 8, // Reduced from 10
    borderRadius: 14, // Smaller radius
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12, // Reduced from 14
    fontWeight: '600',
    color: Colors.gray[600],
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  // List Styles
  list: {
    paddingTop: SEARCH_SECTION_HEIGHT, // Start content below search bar
    paddingHorizontal: 0, // Full width cards
    paddingBottom: 120, // Increased for safe area + tab bar
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
    color: Colors.modern.text.primary,
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
    color: Colors.modern.text.primary,
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
    color: Colors.modern.text.primary,
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
    color: Colors.modern.text.primary,
    letterSpacing: 0.3,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    gap: 12,
  },
  modalSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray[900],
    padding: 0,
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    gap: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: Colors.gray[400],
  },
  noSuggestions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  noSuggestionsText: {
    fontSize: 15,
    color: Colors.gray[400],
  },
});
