import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Canvas,
  Image,
  useImage,
  Skia,
  LinearGradient as SkiaGradient,
  vec,
  Group,
  BackdropBlur,
  Path,
  Rect,
  RoundedRect,
  Fill
} from "@shopify/react-native-skia";

import { api } from "../lib/apiClient"; // Import API client
import { useAuth } from "../lib/AuthContext"; // Import Auth Context
import { EventOut } from "@team-up-main/api-client";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT_DIM } = Dimensions.get("window");
const SCREEN_HEIGHT = SCREEN_HEIGHT_DIM || 800; // Fallback
const CARD_WIDTH = SCREEN_WIDTH - 60;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.35;
const CARD_RADIUS = 24;

const MOCK_IMAGES: Record<string, any> = {
  "mock-1.png": require("../assets/mock-images/mock-1.png"),
  "mock-2.png": require("../assets/mock-images/mock-2.png"),
  "mock-3.png": require("../assets/mock-images/mock-3.png"),
  "mock-4.png": require("../assets/mock-images/mock-4.png"),
};

interface EventCardProps {
  event: EventOut;
  index: number;
  scrollY: any; // Simplified type as we aren't using scrollY heavily for complex logic anymore
}

export default function EventCard({ event, index, scrollY }: EventCardProps) {
  const router = useRouter();
  // Cycle through mock images based on index
  const mockKeys = Object.keys(MOCK_IMAGES);
  const bgImageSource = MOCK_IMAGES[mockKeys[index % mockKeys.length]];
  const bgImage = useImage(bgImageSource);

  // Create Fluted (Moru) Glass Pattern
  const flutedPath = React.useMemo(() => {
    const p = Skia.Path.Make();
    for (let x = 0; x <= CARD_WIDTH; x += 6) {
      p.moveTo(x, 0);
      p.lineTo(x, CARD_HEIGHT);
    }
    return p;
  }, []);




  const booking = event.bookings?.[0];
  const timeSlot = booking?.timeSlot;
  const venue = booking?.venue;
  const court = booking?.court;
  const eventDate = timeSlot?.startsAt ? new Date(timeSlot.startsAt) : new Date(event.createdAt);

  const formatDateTime = (date: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${months[date.getMonth()]} ${date.getDate()} • ${hours}:${minutes}`;
  };

  const { user } = useAuth();
  const [isJoining, setIsJoining] = React.useState(false);

  // Determine initial status based on backend provided userJoinStatus, fallback to checking participants list.
  const [joinStatus, setJoinStatus] = React.useState<'none' | 'pending' | 'joined'>(
    (event.userJoinStatus as 'none' | 'pending' | 'joined' | undefined) || (event.participants?.some(p => p.userId === user?.id) ? 'joined' : 'none')
  );

  React.useEffect(() => {
    const status = (event.userJoinStatus as 'none' | 'pending' | 'joined' | undefined) ||
      (event.participants?.some(p => p.userId === user?.id) ? 'joined' : 'none');
    setJoinStatus(status);
  }, [event.userJoinStatus, event.participants, user?.id]);

  const getVenueName = () => venue?.name || (event as any).venueName || "Outdoor Court";
  const getFieldName = () => court?.name || "Main Field";

  const handleJoin = async () => {
    if (!user) {
      Alert.alert("Please login", "You need to be logged in to join events.");
      return;
    }

    setIsJoining(true);
    try {
      const response = await api.events.join(event.id, { message: "Join request from card" });

      if (response.status === 'approved') {
        Alert.alert("Success", "You have joined the event!");
        setJoinStatus('joined');
      } else if (response.status === 'submitted') {
        Alert.alert("Request Sent", "Your join request is pending approval.");
        setJoinStatus('pending');
      }
    } catch (error: any) {
      console.log('join error', error);
      const errorMessage = error.message?.toLowerCase() || "";

      // Handle case where user already has a pending request
      if (errorMessage.includes("pending") || errorMessage.includes("already requested") || errorMessage.includes("already_applied")) {
        setJoinStatus('pending');
        Alert.alert("Status", "You already have a pending request for this event.");
      }
      // Handle case where user is already joined (but maybe list wasn't updated)
      else if (errorMessage.includes("already joined") || errorMessage.includes("participant")) {
        setJoinStatus('joined');
        Alert.alert("Status", "You are already a participant of this event.");
      }
      else {
        Alert.alert("Error", error.message || "Failed to join event");
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/event/${event.id}`)}
      style={[styles.container, { zIndex: 1000 - index }]}
    >
      {/* Skia Background Layer */}
      {/* Moru Glass Effect Layer */}
      <Canvas style={StyleSheet.absoluteFill}>
        {/* 1. Blur Background */}
        <BackdropBlur blur={15} />

        {/* 2. Base Glass Tint */}
        <Fill color="rgba(255, 255, 255, 0.1)" />

        {/* 5. Glass Border */}
        <RoundedRect
          x={1} y={1}
          width={CARD_WIDTH - 2}
          height={CARD_HEIGHT - 2}
          style="stroke"
          strokeWidth={1}
          color="rgba(22, 15, 15, 0.6)"
          r={CARD_RADIUS}
        />
      </Canvas>

      {/* Text Content Overlay */}
      <View style={styles.contentOverlay}>
        <View style={styles.topSection}>
          <View style={styles.ownerRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{event.owner?.displayName?.[0] || 'O'}</Text>
            </View>
            <Text style={styles.ownerName}>{event.owner?.displayName || 'Unknown Host'}</Text>
          </View>
          <View style={styles.progressBadge}>
            <Ionicons name="people" size={14} color="#333" />
            <Text style={styles.progressText}>{event.currentParticipants || 1}/{event.maxParticipants || 10}</Text>
          </View>
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.subtitle}>{formatDateTime(eventDate)}</Text>
          <Text style={styles.locationText}>{getVenueName()} • {getFieldName()}</Text>

          {event.description ? (
            <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
          ) : null}
        </View>

        <View style={styles.footerSection}>
          {joinStatus === 'joined' ? (
            <View style={styles.joinedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          ) : joinStatus === 'pending' ? (
            <View style={styles.pendingBadge}>
              <Ionicons name="time" size={16} color="#FF9800" />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={(e) => {
                e.stopPropagation(); // Try to prevent card navigation
                handleJoin();
              }}
              disabled={isJoining}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.joinButtonText}>Join</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

    </TouchableOpacity >
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    marginBottom: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    // shadowColor: '#000',
    // shadowOpacity: 0.3,
    // shadowRadius: 10,
    // elevation: 5,
    backgroundColor: 'rgba(255,255,255,0.02)', // Subtle fill for when blur isn't enough
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', // Fallback border
  },
  contentOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  avatarText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18,
  },
  centerSection: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  footerSection: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  joinedText: {
    color: '#388E3C', // darker green
    fontWeight: 'bold',
    fontSize: 14,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pendingText: {
    color: '#F57C00', // darker orange
    fontWeight: 'bold',
    fontSize: 14,
  }
});
