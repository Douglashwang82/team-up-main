import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Canvas, BackdropBlur, Fill } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
  SharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { EventOut } from "@team-up-main/api-client";
import { Colors } from "../constants/Colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT_DIM } = Dimensions.get("window");
const SCREEN_HEIGHT = SCREEN_HEIGHT_DIM || 800; // Fallback
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const CARD_RADIUS = 24;
const CARD_MARGIN_BOTTOM = 32;
const SNAP_INTERVAL = CARD_HEIGHT + CARD_MARGIN_BOTTOM;

const MOCK_IMAGES: Record<string, any> = {
  "mock-1.png": require("../assets/mock-images/mock-1.png"),
  "mock-2.png": require("../assets/mock-images/mock-2.png"),
  "mock-3.png": require("../assets/mock-images/mock-3.png"),
  "mock-4.png": require("../assets/mock-images/mock-4.png"),
  "mock-ava-1.png": require("../assets/mock-images/mock-ava-1.png"),
  "mock-ava-2.png": require("../assets/mock-images/mock-ava-2.png"),
};

const MOCK_AVATARS = [
  require("../assets/mock-images/mock-ava-1.png"),
  require("../assets/mock-images/mock-ava-2.png"),
];

interface EventCardProps {
  event: EventOut;
  index: number;
  scrollY: SharedValue<number>;
}

export default function EventCard({ event, index, scrollY }: EventCardProps) {
  const router = useRouter();

  const pressed = useSharedValue(false);

  // Separate animation for press scaling for reliability
  const pressScale = useDerivedValue(() => {
    return withSpring(pressed.value ? 0.97 : 1, { damping: 12, stiffness: 150 });
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    // Correct focus calculation: focus when scrollY is exactly (index * SNAP_INTERVAL)
    const cardCenter = index * SNAP_INTERVAL;

    const inputRange = [
      cardCenter - SNAP_INTERVAL,
      cardCenter,
      cardCenter + SNAP_INTERVAL,
    ];

    const currentScroll = scrollY?.value ?? 0;

    const scrollScale = interpolate(
      currentScroll,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolate.CLAMP
    );

    const opacityValue = interpolate(
      currentScroll,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: scrollScale * pressScale.value }
      ],
      opacity: opacityValue,
    };
  });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;
    })
    .onFinalize(() => {
      pressed.value = false;
      runOnJS(router.push)(`/event/${event.id}` as any);
    });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getTime = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  const getVenueName = () => {
    if (event.title?.includes("籃球")) return "Civic Center Court";
    if (event.title?.includes("足球")) return "Riverside Field";
    return "Downtown Arena";
  };

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {/* Glassmorphic Content Container - Maximum Backdrop Blur */}
        <View style={styles.glassContainer}>
          <Canvas style={StyleSheet.absoluteFillObject}>
            <BackdropBlur blur={100}>
              <Fill color="rgba(255, 255, 255, 0.3)" />
            </BackdropBlur>
          </Canvas>

          {/* Clean Frosted Matte Overlay */}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255, 255, 255, 0.4)', opacity: 0.9 }]} />

          <View style={styles.contentPadding}>
            {/* Top Row: Date & Status */}
            <View style={styles.topRow}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{formatDate(event.createdAt)}</Text>
                <View style={styles.timeDivider} />
                <Text style={styles.timeText}>{getTime(event.createdAt)}</Text>
              </View>

              <View style={styles.statusBadge}>
                <Ionicons name="people" size={12} color="#FF6B6B" />
                <Text style={styles.statusText}>
                  {event.currentParticipants}/{event.maxParticipants}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>{event.title}</Text>


            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color="#FF6B6B" />
              <Text style={styles.locationText}>{getVenueName()}</Text>
            </View>

            {/* Bottom Row: Avatars */}
            <View style={styles.bottomRow}>
              <View style={styles.avatarStack}>
                {MOCK_AVATARS.slice(0, 3).map((avatar, idx) => (
                  <Image
                    key={idx}
                    source={avatar}
                    style={[styles.avatar, { marginLeft: idx === 0 ? 0 : -10 }]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Faded border highlight - Glimmering edge */}
        <LinearGradient
          colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 0.8 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: CARD_RADIUS, borderWidth: 1, borderColor: 'transparent', borderTopColor: 'rgba(255,255,255,0.3)', borderLeftColor: 'rgba(255,255,255,0.1)' }]}
          pointerEvents="none"
        />
      </Animated.View>
    </GestureDetector >
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 32,
    overflow: 'hidden',
    alignSelf: 'center',

    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: {
        elevation: 12
      }
    })
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  glassContainer: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  contentPadding: {
    flex: 1,
    padding: 28,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dateText: {
    color: '#8B1538',
    fontWeight: '700',
    fontSize: 12,
  },
  timeDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(139,21,56,0.3)',
    marginHorizontal: 8,
  },
  timeText: {
    color: '#8B1538',
    fontWeight: '600',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B1538',
  },
  title: {
    fontSize: 32,
    fontFamily: 'NotoSansTC_700Bold',
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(139,21,56,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
