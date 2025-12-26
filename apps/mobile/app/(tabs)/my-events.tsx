import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EventOut } from '@team-up-main/api-client';
import EventCard from '../../components/EventCard';
import { Colors } from '../../constants/Colors';
import { apis } from '../../lib/api';

export default function MyEventsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createdEvents, setCreatedEvents] = useState<EventOut[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventOut[]>([]);
  const [pendingEvents, setPendingEvents] = useState<EventOut[]>([]);
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');

  // Fetch created events
  const fetchCreatedEvents = async () => {
    try {
      const data = await apis.events.getMyCreatedEvents();
      setCreatedEvents(data);
    } catch (error) {
      console.error('Failed to fetch created events:', error);
    }
  };

  // Fetch joined events and pending requests
  const fetchJoinedEvents = async () => {
    try {
      const [joined, pending] = await Promise.all([
        apis.events.getMyJoinedEvents(),
        apis.events.getMyPendingEvents(),
      ]);
      setJoinedEvents(joined);
      setPendingEvents(pending);
    } catch (error) {
      console.error('Failed to fetch joined events:', error);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    setIsLoading(true);

    if (activeTab === 'created') {
      fetchCreatedEvents().finally(() => setIsLoading(false));
    } else {
      fetchJoinedEvents().finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  // Get events to display based on active tab
  const displayEvents = activeTab === 'created'
    ? createdEvents
    : [...joinedEvents, ...pendingEvents];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'created' && styles.tabActive]}
          onPress={() => setActiveTab('created')}
        >
          <Text style={[styles.tabText, activeTab === 'created' && styles.tabTextActive]}>
            Created
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'joined' && styles.tabActive]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && styles.tabTextActive]}>
            Joined
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your Events...</Text>
        </View>
      ) : displayEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color={Colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Events Yet</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'created'
              ? 'Create your first Event to get started!'
              : 'Join an Event to see it here!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayEvents}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[800],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[400],
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[800],
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[400],
  },
  tabTextActive: {
    color: Colors.primary[400],
  },
  list: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray[400],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
  },
});
