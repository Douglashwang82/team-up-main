import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EventOut } from '@team-up-main/api-client';
import { Colors } from '../constants/Colors';

interface EventCardProps {
  event: EventOut;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: Colors.success[700], text: Colors.success[100], border: Colors.success[500] };
      case 'closed':
        return { bg: Colors.primary[700], text: Colors.primary[100], border: Colors.primary[500] };
      default:
        return { bg: Colors.gray[800], text: Colors.gray[400], border: Colors.gray[500] };
    }
  };

  const getProgressPercentage = () => {
    return Math.min((event.currentParticipants / event.maxParticipants) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return Colors.error[500];
    if (percentage >= 70) return Colors.warning[500];
    return Colors.primary[600];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const statusColor = getStatusColor(event.status);
  const progress = getProgressPercentage();
  const progressColor = getProgressColor(progress);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={styles.shadowContainer}>
        {/* Accent gradient on left edge */}
        <LinearGradient
          colors={[Colors.primary[500], Colors.primary[700]]}
          style={styles.accentBar}
        />

        <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
          <View style={styles.content}>
            {/* Header with badges */}
            <View style={styles.header}>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
                  <Text style={[styles.badgeText, { color: statusColor.text }]}>
                    {event.status.toUpperCase()}
                  </Text>
                </View>
                {event.visibility === 'private' && (
                  <View style={[styles.badge, styles.privateBadge]}>
                    <Ionicons name="lock-closed" size={10} color={Colors.gray[400]} />
                    <Text style={[styles.badgeText, { color: Colors.gray[400] }]}>PRIVATE</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>

            {/* Description */}
            {event.description && (
              <Text style={styles.description} numberOfLines={2}>
                {event.description}
              </Text>
            )}

            {/* Date/Time and Location Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary[400]} />
                <Text style={styles.infoText}>{formatDate(event.createdAt)}</Text>
              </View>
              {event.venue?.name && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color={Colors.primary[400]} />
                  <Text style={styles.infoText} numberOfLines={1}>{event.venue.name}</Text>
                </View>
              )}
            </View>

            {/* Participants Progress */}
            <View style={styles.participants}>
              <View style={styles.participantsHeader}>
                <View style={styles.participantsLeft}>
                  <Ionicons name="people" size={16} color={Colors.gray[400]} />
                  <Text style={styles.participantsText}>
                    {event.currentParticipants}/{event.maxParticipants}
                  </Text>
                </View>
                <Text style={styles.percentage}>{Math.round(progress)}% full</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[progressColor, progressColor]}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.ctaButton, event.status !== 'open' && styles.ctaButtonDisabled]}
              activeOpacity={0.7}
              onPress={() => router.push(`/event/${event.id}`)}
            >
              <LinearGradient
                colors={event.status === 'open' ? [Colors.primary[600], Colors.primary[700]] : [Colors.gray[400], Colors.gray[500]]}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>
                  {event.status === 'open' ? 'Join Event' : 'View Details'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Almost full warning */}
            {progress >= 90 && event.status === 'open' && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={14} color={Colors.warning[400]} />
                <Text style={styles.warningText}>Filling up fast!</Text>
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  shadowContainer: {
    borderRadius: 20,
    backgroundColor: 'transparent',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    zIndex: 2,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray[800],
    backgroundColor: Colors.gray[900],
  },
  content: {
    padding: 20,
    paddingLeft: 24, // Extra padding for accent bar
  },
  header: {
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privateBadge: {
    backgroundColor: Colors.gray[800],
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    color: Colors.gray[400],
    marginBottom: 16,
    lineHeight: 22,
  },
  infoSection: {
    marginBottom: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray[300],
    fontWeight: '500',
    flex: 1,
  },
  participants: {
    marginBottom: 16,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[300],
  },
  percentage: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[400],
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.gray[800],
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.warning[900],
    borderRadius: 10,
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning[400],
    fontWeight: '600',
  },
});
