import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { api } from "../../lib/apiClient";
import { useAuth } from "../../contexts/AuthContext";
import { EventOut } from "@team-up-main/api-client";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface EventCardProps {
  event: EventOut;
  index: number;
  scrollY?: any; // Kept for prop compatibility
  compact?: boolean; // New prop for rendering within confined chat widgets
}

const EventCard = React.memo(({ event, index, compact = false }: EventCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = React.useState(false);

  // Logic bindings identical to previous card
  const booking = event.bookings?.[0];
  const timeSlot = booking?.timeSlot;
  const venue = booking?.venue;
  const court = booking?.court;
  const eventDate = timeSlot?.startsAt ? new Date(timeSlot.startsAt) : new Date(event.createdAt);

  const formatDateTime = (date: Date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "TBD";
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate();
      return `${months[d.getMonth()]} ${day}, ${hours}:${minutes}`;
    } catch {
      return "TBD";
    }
  };

  const [joinStatus, setJoinStatus] = React.useState<'none' | 'pending' | 'joined'>(
    (event.userJoinStatus as 'none' | 'pending' | 'joined' | undefined) ||
    (event.participants?.some(p => p.userId === user?.id) ? 'joined' : 'none')
  );

  React.useEffect(() => {
    const status = (event.userJoinStatus as 'none' | 'pending' | 'joined' | undefined) ||
      (event.participants?.some(p => p.userId === user?.id) ? 'joined' : 'none');
    setJoinStatus(status);
  }, [event.userJoinStatus, event.participants, user?.id]);

  const getVenueName = () => venue?.name || (event as any).venueName || "Outdoor Facility";
  const getFieldName = () => court?.name || "Main Court";

  const handleJoin = async () => {
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to join events.");
      return;
    }

    setIsJoining(true);
    try {
      const response = await api.events.join(event.id);
      if (response.status === 'approved') {
        setJoinStatus('joined');
      } else if (response.status === 'submitted') {
        Alert.alert("Request Sent", "Your request to join is pending host approval.");
        setJoinStatus('pending');
      }
    } catch (error: any) {
      const errorMessage = error.message?.toLowerCase() || "";
      if (errorMessage.includes("pending") || errorMessage.includes("already requested")) {
        setJoinStatus('pending');
      } else if (errorMessage.includes("already joined") || errorMessage.includes("participant")) {
        setJoinStatus('joined');
      } else {
        Alert.alert("Error", error.message || "Failed to join event.");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  const { colors } = useTheme();
  const navColors = colors as any;
  const styles = getStyles(navColors, isDark, compact);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/event/${event.id}`)}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={isDark ? ['rgba(28, 28, 30, 0.95)', 'rgba(20, 20, 22, 0.98)'] : ['rgba(255, 255, 255, 0.9)', 'rgba(249, 250, 251, 0.95)']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* === Header Section === */}
        <View style={styles.header}>
          <View style={styles.hostInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{event.owner?.displayName?.[0]?.toUpperCase() || 'H'}</Text>
            </View>
            <View>
              <Text style={styles.hostLabel}>Hosted by</Text>
              <Text style={styles.hostName} numberOfLines={1}>{event.owner?.displayName || 'Unknown Host'}</Text>
            </View>
          </View>

          {/* Status Badge */}
          {joinStatus === 'joined' && (
            <View style={[styles.statusBadge, styles.badgeJoined]}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.statusTextJoined}>Joined</Text>
            </View>
          )}
          {joinStatus === 'pending' && (
            <View style={[styles.statusBadge, styles.badgePending]}>
              <Ionicons name="time" size={14} color="#F59E0B" />
              <Text style={styles.statusTextPending}>Pending</Text>
            </View>
          )}
        </View>

        {/* === Body Section === */}
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          {/* Details Row */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#3B82F6" style={styles.detailIcon} />
              <Text style={styles.detailText}>{formatDateTime(eventDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#8B5CF6" style={styles.detailIcon} />
              <Text style={styles.detailText} numberOfLines={1}>
                {getVenueName()} • {getFieldName()}
              </Text>
            </View>
          </View>

          {event.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {event.description}
            </Text>
          ) : null}
        </View>

        {/* === Footer Section === */}
        <View style={styles.footer}>
          <View style={styles.participantInfo}>
            <View style={styles.participantPill}>
              <Ionicons name="people" size={14} color={navColors.textSecondary} />
              <Text style={styles.participantCount}>
                {event.currentParticipants || 1} <Text style={styles.participantMax}>/ {event.maxParticipants || 10}</Text>
              </Text>
            </View>
            <Text style={styles.sportBadge}>{String(event.durationType) === 'match' ? 'Match' : 'Practice'}</Text>
          </View>

          {joinStatus === 'none' && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={(e) => {
                e.stopPropagation();
                handleJoin();
              }}
              disabled={isJoining}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.joinButtonText}>Join Event</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const getStyles = (colors: any, isDark: boolean, compact: boolean) => StyleSheet.create({
  cardContainer: {
    width: compact ? '100%' : CARD_WIDTH,
    alignSelf: 'center',
    marginBottom: compact ? 12 : 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    ...Platform.select({
      ios: {
        shadowColor: isDark ? '#000' : 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.25 : 0.8,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  hostLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hostName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  badgeJoined: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusTextJoined: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 16,
    lineHeight: 28,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    width: 20,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  participantCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  participantMax: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  sportBadge: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default EventCard;
