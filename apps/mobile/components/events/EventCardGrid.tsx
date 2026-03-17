import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { EventOut } from "@team-up-main/api-client";
import { Colors } from "../../constants/Colors";



interface EventCardGridProps {
  event: EventOut;
}

export default function EventCardGrid({ event }: EventCardGridProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return { bg: Colors.success[700], text: Colors.success[100] };
      case "closed":
        return { bg: Colors.error[700], text: Colors.error[100] };
      default:
        return { bg: Colors.gray[700], text: Colors.gray[200] };
    }
  };

  const getProgressPercentage = () => {
    return Math.min(
      (event.currentParticipants / event.maxParticipants) * 100,
      100,
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return Colors.error[500];
    if (percentage >= 70) return Colors.warning[500];
    return Colors.primary;
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
    return "trophy-outline";
  };

  const statusColor = getStatusColor(event.status);
  const progress = getProgressPercentage();
  const progressColor = getProgressColor(progress);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/event/${event.id}`)}
      style={styles.container}
    >
      <View style={styles.cardContent}>
        {/* Event Image */}
        <View style={styles.imageContainer}>
          {(event as any).image ? (
            <Image
              source={{ uri: (event as any).image }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.imageGradient}
            >
              <Ionicons
                name={getCategoryIcon()}
                size={24}
                color="rgba(255,255,255,0.3)"
              />
            </LinearGradient>
          )}
          <View style={styles.imageOverlay} />

          {/* Status Badge */}
          <View
            style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
          >
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {event.status === "open" ? "開放" : "結束"}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title with Owner Avatar */}
          <View style={styles.titleRow}>
            {event.owner?.avatarUrl ? (
              <Image
                source={{ uri: event.owner.avatarUrl }}
                style={styles.ownerAvatar}
              />
            ) : (
              <View style={styles.ownerAvatarPlaceholder}>
                <Text style={styles.ownerAvatarText}>
                  {event.owner?.displayName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                <Text style={styles.progressHighlight}>
                  {event.currentParticipants}
                </Text>
                <Text style={styles.progressTotal}>
                  /{event.maxParticipants}
                </Text>
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(progress)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%`, backgroundColor: progressColor },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: Colors.gray[900],
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    borderColor: Colors.gray[800],
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
  },
  // Image
  imageContainer: {
    aspectRatio: 1.5,
    width: '100%',
    position: "relative",
    overflow: "hidden",
  },
  imageGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  eventImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // Content
  content: {
    backgroundColor: Colors.white,
    padding: 10,
  },
  // Title
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ownerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  ownerAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  ownerAvatarText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "black",
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  // Progress
  progressContainer: {
    backgroundColor: Colors.gray[800],
    borderRadius: 6,
    padding: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    alignItems: "flex-end",
  },
  progressLabel: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  progressHighlight: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  progressTotal: {
    fontSize: 10,
    color: Colors.gray[400],
    marginLeft: 1,
  },
  progressPercent: {
    fontSize: 9,
    fontWeight: "600",
    color: Colors.gray[400],
  },
  progressBarBg: {
    height: 3,
    backgroundColor: Colors.gray[700],
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
});
