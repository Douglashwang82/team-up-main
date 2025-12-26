import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { api } from '../../lib/apiClient';
import { useAuth } from '../../lib/AuthContext';
import type { EventDetails } from '../../lib/types';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setError(null);
      const data = await api.events.get(id as string);
      setEvent(data);
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Failed to load event details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!event) return;

    setIsJoining(true);
    try {
      const response = await api.events.join(event.id, {
        message: 'I would like to join this event!',
      });

      Alert.alert(
        'Success',
        response.message,
        [
          {
            text: 'OK',
            onPress: () => loadEvent(), // Reload to get updated data
          },
        ]
      );
    } catch (err) {
      console.error('Failed to join event:', err);
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to join event. Please try again.'
      );
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: Colors.success[700], text: Colors.success[500] };
      case 'closed':
        return { bg: Colors.primary[900], text: Colors.primary[400] };
      default:
        return { bg: Colors.gray[800], text: Colors.gray[400] };
    }
  };

  const isOwner = user && event && event.owner_user_id === user.id;
  const hasJoined = user && event && event.participants.some(p => p.user_id === user.id);
  const canJoin = event && event.status === 'open' && !hasJoined && !isOwner;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={Colors.error[500]} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorSubtitle}>{error || 'Event not found'}</Text>
          <Button title="Go Back" onPress={() => router.back()} style={styles.errorButton} />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(event.status);
  const progress = (event.current_participants / event.max_participants) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.badgeText, { color: statusColor.text }]}>
                {event.status.toUpperCase()}
              </Text>
            </View>
            {event.visibility === 'private' && (
              <View style={[styles.badge, { backgroundColor: Colors.gray[800] }]}>
                <Text style={[styles.badgeText, { color: Colors.gray[400] }]}>PRIVATE</Text>
              </View>
            )}
            {event.duration_type === 'permanent' && (
              <View style={[styles.badge, { backgroundColor: Colors.primary[900] }]}>
                <Text style={[styles.badgeText, { color: Colors.primary[400] }]}>RECURRING</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{event.title}</Text>
          {event.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}
        </Card>

        <Card style={styles.participantsCard}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsCount}>
              {event.current_participants} / {event.max_participants} joined
            </Text>
            <Text style={styles.participantsPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: progress >= 90 ? Colors.error[500] : Colors.primary[600],
                },
              ]}
            />
          </View>

          {event.participants.length > 0 && (
            <View style={styles.participantsList}>
              {event.participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.participantAvatar}>
                    <Ionicons name="person" size={16} color={Colors.gray[400]} />
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{participant.display_name}</Text>
                    {participant.role === 'owner' && (
                      <View style={styles.ownerBadge}>
                        <Text style={styles.ownerBadgeText}>Owner</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {event.bookings && event.bookings.length > 0 && (
          <Card style={styles.bookingsCard}>
            <Text style={styles.sectionTitle}>Venue Bookings</Text>
            {event.bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingItem}>
                <View style={styles.bookingHeader}>
                  <Ionicons name="location" size={20} color={Colors.primary[400]} />
                  <Text style={styles.bookingVenue}>{booking.venue.name}</Text>
                </View>
                <Text style={styles.bookingCourt}>{booking.court.name} - {booking.court.sport_type}</Text>
                <Text style={styles.bookingTime}>
                  {new Date(booking.time_slot.starts_at).toLocaleString()} - {new Date(booking.time_slot.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.bookingAddress}>{booking.venue.address}, {booking.venue.city}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      {canJoin && (
        <View style={styles.footer}>
          <Button
            title="Join Event"
            onPress={handleJoin}
            fullWidth
            size="large"
            loading={isJoining}
          />
        </View>
      )}

      {hasJoined && !isOwner && (
        <View style={styles.footer}>
          <View style={styles.joinedMessage}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success[500]} />
            <Text style={styles.joinedText}>You've joined this event!</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.success[700],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[800],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    backgroundColor: Colors.gray[900],
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 150,
  },
  mainCard: {
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.gray[400],
    lineHeight: 24,
  },
  participantsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 16,
  },
  participantsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[300],
  },
  participantsPercentage: {
    fontSize: 14,
    color: Colors.gray[400],
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[800],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  participantsList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  ownerBadge: {
    backgroundColor: Colors.primary[900],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary[400],
  },
  bookingsCard: {
    marginBottom: 16,
  },
  bookingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[800],
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bookingVenue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  bookingCourt: {
    fontSize: 14,
    color: Colors.gray[300],
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: Colors.gray[400],
    marginBottom: 4,
  },
  bookingAddress: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.gray[900],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[800],
  },
  joinedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  joinedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success[500],
  },
});
