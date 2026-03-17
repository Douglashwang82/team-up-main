import React, { useState, useRef, useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, FlatList, StyleSheet, Keyboard, useColorScheme } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EventCard from '../../components/events/EventCard';
import { Colors } from '../../constants/Colors';
import LiquidSearchBar from '../../components/ui/LiquidSearchBar';
import EventFilterModal from '../../components/events/EventFilterModal';
import { useEvents } from '../../hooks/useEvents';
import { styles } from './index.styles';
import { useTheme } from '@react-navigation/native';

const SEARCH_SECTION_HEIGHT = 70;

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navColors = colors as any;
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';

  // Dynamic Theme mapping
  const theme = {
    bg: isDark ? '#0f0f13' : '#F3F4F6',
    textPrimary: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#A0AAB5' : '#6B7280',
    glassTint: isDark ? 'rgba(40, 40, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    filterDotBorder: isDark ? '#0f0f13' : '#F3F4F6',
  };

  const {
    events,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    keyword,
    setKeyword,
    activeFilters,
    setActiveFilters,
    loadEvents,
    handleRefresh,
    loadMoreEvents,
  } = useEvents();

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Scroll animation state
  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const headerHeight = SEARCH_SECTION_HEIGHT + insets.top;
    const translateY = interpolate(scrollY.value, [0, headerHeight], [0, -headerHeight], Extrapolate.CLAMP);
    return { transform: [{ translateY }] };
  }, [insets.top]);

  const openSearchModal = () => {
    setSearchModalVisible(true);
    setSearchInput(keyword);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearchModal = () => {
    setSearchModalVisible(false);
    Keyboard.dismiss();
  };

  const applySearch = (searchTerm: string) => {
    setKeyword(searchTerm);
    closeSearchModal();
  };

  const filteredSuggestions = useMemo(() => {
    if (!searchInput.trim()) return events.slice(0, 10);
    const lowerInput = searchInput.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(lowerInput) ||
      event.owner?.displayName?.toLowerCase().includes(lowerInput)
    ).slice(0, 10);
  }, [searchInput, events]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      <Animated.View style={[styles.searchSection, { paddingTop: insets.top + 8 }, headerAnimatedStyle]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LiquidSearchBar
            value={searchInput}
            onChangeText={(text) => {
              setSearchInput(text);
              if (!searchModalVisible) setSearchModalVisible(true);
            }}
            onFocus={() => setSearchModalVisible(true)}
            onSubmitEditing={() => applySearch(searchInput)}
            onClear={() => { setSearchInput(''); setKeyword(''); }}
            onCancel={closeSearchModal}
            isFocused={searchModalVisible}
            inputRef={searchInputRef}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filterButtonGlass}>
              {(activeFilters.category || activeFilters.division || activeFilters.datetime_after) && (
                <View style={[styles.activeFilterDot, { borderColor: theme.filterDotBorder }]} />
              )}
              <Ionicons name="options-outline" size={24} color={isDark ? '#E5E5EA' : Colors.gray[600]} />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.loadingText, { color: theme.textPrimary }]}>Finding amazing events...</Text>
              <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>Just a moment</Text>
            </View>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle" size={64} color={Colors.error[500]} />
            </View>
            <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>Oops!</Text>
            <Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>{error}</Text>
            <TouchableOpacity onPress={() => loadEvents(true)} style={styles.retryButton}>
              <LinearGradient
                colors={isDark ? ['#F97316', '#fdba74'] : ['#F97316', '#FB923C']}
                style={styles.retryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient colors={isDark ? ['#1C1C1E', '#2C2C2E'] : [Colors.base, Colors.cardbase]} style={styles.emptyIconGradient}>
                <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
              </LinearGradient>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Events Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {keyword ? 'Try adjusting your search terms or filters' : 'Be the first to create an event and start connecting!'}
            </Text>
            {!keyword && (
              <TouchableOpacity style={styles.createEventButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={isDark ? ['#F97316', '#fdba74'] : ['#F97316', '#FB923C']}
                  style={styles.createEventGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.createEventText}>Create Event</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Animated.FlatList
            style={{ flex: 1 }}
            data={events}
            renderItem={({ item, index }) => <EventCard event={item} index={index} scrollY={scrollY} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingTop: SEARCH_SECTION_HEIGHT + insets.top }]}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            pagingEnabled={false}
            onEndReached={loadMoreEvents}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingMore ? <View style={{ padding: 20, alignItems: 'center' }}><ActivityIndicator size="small" color={Colors.primary} /></View> : null}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
          />
        )
        }

        {
          searchModalVisible && (
            <Animated.View style={[styles.suggestionsOverlay, { top: SEARCH_SECTION_HEIGHT + insets.top, backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }]}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: navColors.card, opacity: 0.9 }]} />
              <FlatList
                data={filteredSuggestions}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                style={styles.suggestionsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.suggestionItem, { borderBottomColor: navColors.border }]}
                    onPress={() => {
                      setSearchInput(item.title);
                      applySearch(item.title);
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color={navColors.textSecondary} />
                    <View style={styles.suggestionContent}>
                      <Text style={[styles.suggestionTitle, { color: navColors.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.suggestionSubtitle, { color: navColors.textSecondary }]} numberOfLines={1}>
                        {item.owner?.displayName || 'Anonymous'}
                      </Text>
                    </View>
                    <Ionicons name="arrow-up-left-box" size={16} color={navColors.textSecondary} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.noSuggestions}>
                    <Ionicons name="search-outline" size={48} color={navColors.textSecondary} />
                    <Text style={[styles.noSuggestionsText, { color: navColors.textSecondary }]}>開始輸入以搜尋活動</Text>
                  </View>
                }
              />
            </Animated.View>
          )
        }
      </SafeAreaView >

      <EventFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        currentFilters={activeFilters}
        onApply={setActiveFilters}
      />
    </View >
  );
}
