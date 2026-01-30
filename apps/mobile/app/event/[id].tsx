import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { Colors } from "../../constants/Colors";
import { api } from "../../lib/apiClient";
import { useAuth } from "../../lib/AuthContext";
import type { EventDetails } from "../../lib/types";

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
      console.error("Failed to load event:", err);
      setError("Failed to load event details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!event) return;

    setIsJoining(true);
    try {
      const response = await api.events.join(event.id, {
        message: "我想加入這個活動！",
      });

      Alert.alert("成功", response.message, [
        {
          text: "確定",
          onPress: () => loadEvent(), // Reload to get updated data
        },
      ]);
    } catch (err) {
      console.error("Failed to join event:", err);
      Alert.alert(
        "錯誤",
        err instanceof Error ? err.message : "加入活動失敗，請重試。",
      );
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return { bg: Colors.success[700], text: Colors.success[500] };
      case "closed":
        return { bg: Colors.secondary, text: Colors.tertiary };
      default:
        return { bg: Colors.gray[800], text: Colors.gray[400] };
    }
  };

  const isOwner = user && event && event.owner_user_id === user.id;
  const hasJoined =
    user && event && event.participants.some((p) => p.user_id === user.id);
  const canJoin = event && event.status === "open" && !hasJoined && !isOwner;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>正在載入活動...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={80}
            color={Colors.error[500]}
          />
          <Text style={styles.errorTitle}>糟糕！</Text>
          <Text style={styles.errorSubtitle}>{error || "找不到活動"}</Text>
          <Button
            title="返回"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(event.status);
  const progress = (event.current_participants / event.max_participants) * 100;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>活動詳情</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.mainCard}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.badgeText, { color: statusColor.text }]}>
                {event.status.toUpperCase()}
              </Text>
            </View>
            {event.visibility === "private" && (
              <View
                style={[styles.badge, { backgroundColor: Colors.gray[200] }]}
              >
                <Text style={[styles.badgeText, { color: Colors.gray[600] }]}>
                  私人
                </Text>
              </View>
            )}
            {event.duration_type === "permanent" && (
              <View
                style={[styles.badge, { backgroundColor: Colors.secondary }]}
              >
                <Text style={[styles.badgeText, { color: Colors.tertiary }]}>
                  定期
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{event.title}</Text>
          {event.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}
        </Card>

        <Card style={styles.participantsCard}>
          <Text style={styles.sectionTitle}>參加者</Text>
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsCount}>
              {event.current_participants} / {event.max_participants} 已加入
            </Text>
            <Text style={styles.participantsPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor:
                    progress >= 90 ? Colors.error[500] : Colors.primary,
                },
              ]}
            />
          </View>

          {event.participants.length > 0 && (
            <View style={styles.participantsList}>
              {event.participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.participantAvatar}>
                    <Ionicons
                      name="person"
                      size={16}
                      color={Colors.gray[400]}
                    />
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      {participant.display_name}
                    </Text>
                    {participant.role === "owner" && (
                      <View style={styles.ownerBadge}>
                        <Text style={styles.ownerBadgeText}>主辦人</Text>
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
            <Text style={styles.sectionTitle}>場地預訂</Text>
            {event.bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingItem}>
                <View style={styles.bookingHeader}>
                  <Ionicons name="location" size={20} color={Colors.tertiary} />
                  <Text style={styles.bookingVenue}>{booking.venue.name}</Text>
                </View>
                <Text style={styles.bookingCourt}>
                  {booking.court.name} - {booking.court.sport_type}
                </Text>
                <Text style={styles.bookingTime}>
                  {new Date(booking.time_slot.starts_at).toLocaleString()} -{" "}
                  {new Date(booking.time_slot.ends_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.bookingAddress}>
                  {booking.venue.address}, {booking.venue.city}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      {canJoin && (
        <View style={styles.footer}>
          <Button
            title="加入活動"
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
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.success[500]}
            />
            <Text style={styles.joinedText}>您已加入此活動！</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[800],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray[900],
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    backgroundColor: Colors.base,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 150,
  },
  mainCard: {
    marginBottom: 16,
  },
  badges: {
    flexDirection: "row",
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
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray[900],
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.gray[600],
    lineHeight: 24,
  },
  participantsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray[900],
    marginBottom: 16,
  },
  participantsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  participantsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[700],
  },
  participantsPercentage: {
    fontSize: 14,
    color: Colors.gray[400],
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  participantsList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  participantName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[900],
  },
  ownerBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.tertiary,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  bookingVenue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[900],
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
    backgroundColor: Colors.base,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[800],
  },
  joinedMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  joinedText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.success[500],
  },
});
