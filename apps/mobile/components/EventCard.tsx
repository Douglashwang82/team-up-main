import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "expo-glass-effect";

import { EventOut } from "@team-up-main/api-client";
import { Colors } from "../constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 24;
const CARD_HEIGHT = 220; // Taller for immersive image
const CARD_RADIUS = 24;

const MOCK_IMAGES: Record<string, any> = {
  "mock-1.png": require("../assets/mock-images/mock-1.png"),
  "mock-2.png": require("../assets/mock-images/mock-2.png"),
  "mock-3.png": require("../assets/mock-images/mock-3.png"),
  "mock-4.png": require("../assets/mock-images/mock-4.png"),
  "mock-ava-1.png": require("../assets/mock-images/mock-ava-1.png"),
  "mock-ava-2.png": require("../assets/mock-images/mock-ava-2.png"),
};

// Simulated extracted colors for mock images to bypass native module requirement
const MOCK_IMAGE_COLORS: Record<string, string> = {
  "mock-1.png": "#f97316", // Orange (Basketball)
  "mock-2.png": "#3b82f6", // Blue (Football)
  "mock-3.png": "#22c55e", // Green (Running)
  "mock-4.png": "#a855f7", // Purple (Yoga)
};

// Mock avatars for attendees
const MOCK_AVATARS = [
  require("../assets/mock-images/mock-ava-1.png"),
  require("../assets/mock-images/mock-ava-2.png"),
];

interface EventCardProps {
  event: EventOut;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const [extractedColor, setExtractedColor] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate color extraction
    const imageName = (event as any).image;
    if (imageName && MOCK_IMAGE_COLORS[imageName]) {
      setExtractedColor(MOCK_IMAGE_COLORS[imageName]);
    } else {
      setExtractedColor(null);
    }
  }, [event]);

  // Helper to get category label
  const getCategoryLabel = (): string => {
    const title = event.title?.toLowerCase() || "";
    if (title.includes("籃球") || title.includes("basketball")) return "籃球";
    if (title.includes("跑步") || title.includes("run") || title.includes("慢跑")) return "跑步";
    if (title.includes("足球") || title.includes("soccer") || title.includes("football")) return "足球";
    if (title.includes("游泳") || title.includes("swim")) return "游泳";
    if (title.includes("登山") || title.includes("hiking") || title.includes("爬山")) return "登山";
    if (title.includes("yoga") || title.includes("瑜珈")) return "瑜珈";
    if (title.includes("健身") || title.includes("fitness")) return "健身";
    if (title.includes("羽球") || title.includes("badminton")) return "羽球";
    if (title.includes("網球") || title.includes("tennis")) return "網球";
    if (title.includes("桌球") || title.includes("ping pong")) return "桌球";
    return "活動";
  };

  // Get category-specific colors for badge
  const getCategoryColors = (): { bg: string; text: string } => {
    // 1. Try dynamic color first
    if (extractedColor) {
      return { bg: extractedColor, text: "#FFF" };
    }

    // 2. Fallback to static mapping
    const title = event.title?.toLowerCase() || "";
    // Basketball - Orange
    if (title.includes("籃球") || title.includes("basketball"))
      return { bg: "rgba(249, 115, 22, 0.8)", text: "#FFF" };
    // Running - Green
    if (title.includes("跑步") || title.includes("run") || title.includes("慢跑"))
      return { bg: "rgba(34, 197, 94, 0.8)", text: "#FFF" };
    // Football/Soccer - Blue
    if (title.includes("足球") || title.includes("soccer") || title.includes("football"))
      return { bg: "rgba(59, 130, 246, 0.8)", text: "#FFF" };
    // Swimming - Cyan
    if (title.includes("游泳") || title.includes("swim"))
      return { bg: "rgba(6, 182, 212, 0.8)", text: "#FFF" };
    // Hiking - Brown/Earth
    if (title.includes("登山") || title.includes("hiking") || title.includes("爬山"))
      return { bg: "rgba(120, 113, 108, 0.8)", text: "#FFF" };
    // Yoga - Purple
    if (title.includes("yoga") || title.includes("瑜珈"))
      return { bg: "rgba(168, 85, 247, 0.8)", text: "#FFF" };
    // Fitness - Red
    if (title.includes("健身") || title.includes("fitness"))
      return { bg: "rgba(239, 68, 68, 0.8)", text: "#FFF" };
    // Badminton - Teal
    if (title.includes("羽球") || title.includes("badminton"))
      return { bg: "rgba(20, 184, 166, 0.8)", text: "#FFF" };
    // Tennis - Lime
    if (title.includes("網球") || title.includes("tennis"))
      return { bg: "rgba(132, 204, 22, 0.8)", text: "#FFF" };
    // Table Tennis - Pink
    if (title.includes("桌球") || title.includes("ping pong"))
      return { bg: "rgba(236, 72, 153, 0.8)", text: "#FFF" };
    // Default - Golden/Amber
    return { bg: "rgba(212, 168, 83, 0.8)", text: "#FFF" };
  };

  // Category-based icon for placeholder when no image
  const getCategoryIcon = (): keyof typeof Ionicons.glyphMap => {
    const title = event.title?.toLowerCase() || "";
    if (title.includes("籃球") || title.includes("basketball")) return "basketball-outline";
    if (title.includes("跑步") || title.includes("run") || title.includes("慢跑")) return "fitness-outline";
    if (title.includes("足球") || title.includes("soccer") || title.includes("football")) return "football-outline";
    if (title.includes("游泳") || title.includes("swim")) return "water-outline";
    if (title.includes("登山") || title.includes("hiking") || title.includes("爬山")) return "trail-sign-outline";
    if (title.includes("yoga") || title.includes("瑜珈")) return "body-outline";
    // Generic fallback mapping based on common keywords if image is missing
    if (title.includes("羽球") || title.includes("badminton")) return "tennisball-outline";
    if (title.includes("網球") || title.includes("tennis")) return "tennisball-outline";
    if (title.includes("桌球") || title.includes("ping pong")) return "ellipse-outline";
    return "trophy-outline";
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
    const weekday = weekdays[d.getDay()];
    return `${weekday}, ${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // Get venue name or placeholder
  const getVenueName = () => {
    const title = event.title?.toLowerCase() || "";
    if (title.includes("籃球")) return "籃球場";
    if (title.includes("足球")) return "足球場";
    if (title.includes("游泳")) return "游泳池";
    if (title.includes("健身")) return "健身房";
    return "運動場地";
  };

  // Calculate friends going (mock data for now)
  const friendsGoing = Math.max(0, event.currentParticipants - 1);

  // Calculate dynamic tint for the bottom glass pane
  const bottomPaneTint = extractedColor ? extractedColor : 'rgba(255,255,255,0.65)';
  const bottomPaneStyle = {
    backgroundColor: extractedColor ? undefined : 'rgba(255,255,255,0.65)'
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/event/${event.id}` as any)}
      style={styles.container}
    >
      {/* 1. Background Image Layer */}
      <View style={StyleSheet.absoluteFillObject}>
        {(event as any).image && MOCK_IMAGES[(event as any).image] ? (
          <Image
            source={MOCK_IMAGES[(event as any).image]}
            style={styles.bgImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={["#f5c6a0", "#f8e1c8"]} // Fallback gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bgImage}
          >
            <Ionicons
              name={getCategoryIcon()}
              size={80}
              color="rgba(255,255,255,0.5)"
              style={{ position: 'absolute', bottom: -10, right: -10 }}
            />
          </LinearGradient>
        )}
      </View>

      {/* 2. Floating Badges (Top) */}
      <View style={styles.topBadgesContainer}>
        {/* Category Pill */}
        <View style={[styles.glassPill, { backgroundColor: getCategoryColors().bg }]}>
          <Text style={styles.pillText}>
            {getCategoryLabel().toUpperCase()}
          </Text>
        </View>

        {/* Date Pill (Glass) */}
        <View style={styles.glassPillNeutral}>
          <GlassView
            style={StyleSheet.absoluteFillObject}
            glassEffectStyle="regular"
          />
          <Ionicons name="calendar-outline" size={12} color={Colors.gray[800]} style={{ marginRight: 4 }} />
          <Text style={styles.pillTextDark}>{formatDate(event.createdAt)}</Text>
        </View>
      </View>

      {/* 3. Bottom Glass Info Pane */}
      <View style={styles.bottomGlassContainer}>
        {/* Glass Effect */}
        <GlassView
          style={StyleSheet.absoluteFillObject}
          glassEffectStyle="clear" // Frosted white look
        />

        {/* White tint overlay for stronger "Frosted" look ensuring text readability */}
        {/* If dynamic color exists, allow it to tint the glass slightly, coupled with white to ensure contrast */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.7)' }]} />
        {extractedColor && (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: extractedColor, opacity: 0.15 }]} />
        )}

        {/* Content */}
        <View style={styles.infoContent}>
          {/* Title & Venue */}
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
            <View style={styles.venueRow}>
              <Ionicons name="location-outline" size={12} color={Colors.gray[500]} />
              <Text style={styles.venueText} numberOfLines={1}>{getVenueName()}</Text>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.attendeesContainer}>
            <View style={styles.avatarStack}>
              {MOCK_AVATARS.slice(0, Math.min(3, event.currentParticipants)).map((avatar, index) => (
                <View
                  key={index}
                  style={[
                    styles.avatarWrapper,
                    { marginLeft: index > 0 ? -10 : 0, zIndex: 3 - index, borderColor: "#FFF" }, // Ensure white border on avatars
                  ]}
                >
                  <Image source={avatar} style={styles.avatar} />
                </View>
              ))}
              {event.currentParticipants > 3 && (
                <View style={[styles.avatarWrapper, styles.avatarMore, { marginLeft: -10, zIndex: 0, borderColor: "#FFF" }]}>
                  <Text style={styles.avatarMoreText}>+{event.currentParticipants - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    // Card Shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
    backgroundColor: '#fff', // Base for shadow
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },

  // Top Badges
  topBadgesContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  glassPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  glassPillNeutral: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden', // For GlassView
    backgroundColor: 'rgba(255,255,255,0.4)', // Fallback
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  pillTextDark: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray[800],
  },

  // Bottom Pane
  bottomGlassContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // Fixed height for info pane
    overflow: 'hidden',
  },
  infoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "NotoSansTC_700Bold",
    fontWeight: "700",
    color: Colors.gray[900],
    marginBottom: 4,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  venueText: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: "NotoSansTC_500Medium",
  },

  // Attendees
  attendeesContainer: {
    justifyContent: 'center',
  },
  avatarStack: {
    flexDirection: "row",
  },
  avatarWrapper: {
    width: 32, // Slightly larger
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFF",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarMore: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.white,
  },
});
