import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventStatus } from "../../lib/types";
import { apis } from "../../lib/api";
import { TicketDetailOut, MatchedEventSummary } from "@team-up-main/api-client";
import { Colors } from "../../constants/Colors";
import EventCard from "../../components/EventCard";

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetailOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const data = await apis.tickets.getTicket({ ticketId: id as string });
      setTicket(data);
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
      setError("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !ticket) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "找不到球票"}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>球票詳情</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.ticketHeader}>
            <Text style={styles.sportType}>{ticket.sportType}</Text>
            <View
              style={[
                styles.statusBadge,
                ticket.status === "matched"
                  ? styles.statusMatched
                  : styles.statusOpen,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  ticket.status === "matched"
                    ? styles.textMatched
                    : styles.textOpen,
                ]}
              >
                {ticket.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.gray[600]}
              />
              <Text style={styles.detailLabel}>日期</Text>
              <Text style={styles.detailValue}>
                {new Date(ticket.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color={Colors.gray[600]}
              />
              <Text style={styles.detailLabel}>時間</Text>
              <Text style={styles.detailValue}>{ticket.startTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="fitness-outline"
                size={20}
                color={Colors.gray[600]}
              />
              <Text style={styles.detailLabel}>強度</Text>
              <Text style={styles.detailValue}>{ticket.intensity}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="hourglass-outline"
                size={20}
                color={Colors.gray[600]}
              />
              <Text style={styles.detailLabel}>時長</Text>
              <Text style={styles.detailValue}>
                {ticket.durationMinutes} 分鐘
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>配對活動</Text>
          {ticket.matchedEvents && ticket.matchedEvents.length > 0 ? (
            ticket.matchedEvents.map((event: MatchedEventSummary) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  currentParticipants: 0,
                  maxParticipants: 0,
                  visibility: "public",
                  durationType: "temporary",
                  createdAt: new Date(),
                  status: event.status as EventStatus,
                }}
              />
            ))
          ) : (
            <View style={styles.emptyMatches}>
              <Ionicons
                name="search-outline"
                size={48}
                color={Colors.gray[400]}
              />
              <Text style={styles.emptyMatchesText}>尚未找到配對</Text>
              <Text style={styles.emptyMatchesSubText}>
                找到配對時我們會通知您！
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray[900],
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sportType: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.gray[900],
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusOpen: {
    backgroundColor: Colors.tertiary,
  },
  statusMatched: {
    backgroundColor: Colors.success[100],
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  textOpen: {
    color: Colors.primary,
  },
  textMatched: {
    color: Colors.success[700],
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  detailItem: {
    width: "45%",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[900],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray[900],
    marginBottom: 16,
  },
  emptyMatches: {
    alignItems: "center",
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderStyle: "dashed",
  },
  emptyMatchesText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMatchesSubText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.error[500],
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
});
