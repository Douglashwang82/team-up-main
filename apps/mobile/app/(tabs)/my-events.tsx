import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventOut } from "@team-up-main/api-client";
import EventCardGrid from "../../components/EventCardGrid";
import { Colors } from "../../constants/Colors";
import { apis } from "../../lib/api";

type FilterType = "created" | "joined" | "pending";

export default function MyEventsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createdEvents, setCreatedEvents] = useState<EventOut[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventOut[]>([]);
  const [pendingEvents, setPendingEvents] = useState<EventOut[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("created");

  // Fetch created events
  const fetchCreatedEvents = async () => {
    try {
      const data = await apis.events.getMyCreatedEvents();
      setCreatedEvents(data);
    } catch (error) {
      console.error("Failed to fetch created events:", error);
    }
  };

  // Fetch joined events
  const fetchJoinedEvents = async () => {
    try {
      const data = await apis.events.getMyJoinedEvents();
      setJoinedEvents(data);
    } catch (error) {
      console.error("Failed to fetch joined events:", error);
    }
  };

  // Fetch pending events
  const fetchPendingEvents = async () => {
    try {
      const data = await apis.events.getMyPendingEvents();
      setPendingEvents(data);
    } catch (error) {
      console.error("Failed to fetch pending events:", error);
    }
  };

  // Load data when filter changes
  useEffect(() => {
    setIsLoading(true);

    if (activeFilter === "created") {
      fetchCreatedEvents().finally(() => setIsLoading(false));
    } else if (activeFilter === "joined") {
      fetchJoinedEvents().finally(() => setIsLoading(false));
    } else {
      fetchPendingEvents().finally(() => setIsLoading(false));
    }
  }, [activeFilter]);

  // Get events to display based on active filter
  const getDisplayEvents = () => {
    switch (activeFilter) {
      case "created":
        return createdEvents;
      case "joined":
        return joinedEvents;
      case "pending":
        return pendingEvents;
      default:
        return [];
    }
  };

  const displayEvents = getDisplayEvents();

  // Filter options
  const filters: { key: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "created", label: "已發起", icon: "add-circle-outline" },
    { key: "joined", label: "已加入", icon: "checkmark-circle-outline" },
    { key: "pending", label: "已申請", icon: "time-outline" },
  ];

  const getEmptyMessage = () => {
    switch (activeFilter) {
      case "created":
        return {
          title: "尚無發起的活動",
          subtitle: "建立您的第一個活動並開始組團！",
        };
      case "joined":
        return {
          title: "尚未加入活動",
          subtitle: "瀏覽活動並加入感興趣的組團！",
        };
      case "pending":
        return {
          title: "尚無申請中的活動",
          subtitle: "申請加入活動後將顯示於此！",
        };
      default:
        return {
          title: "尚無活動",
          subtitle: "開始探索活動吧！",
        };
    }
  };

  const emptyMessage = getEmptyMessage();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
              ]}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={activeFilter === filter.key ? Colors.white : Colors.gray[600]}
              />
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Divider Line */}
      <View style={styles.divider} />

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>正在載入您的活動...</Text>
        </View>
      ) : displayEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="calendar-outline"
            size={80}
            color={Colors.gray[400]}
          />
          <Text style={styles.emptyTitle}>{emptyMessage.title}</Text>
          <Text style={styles.emptySubtitle}>{emptyMessage.subtitle}</Text>
        </View>
      ) : (
        <FlatList
          data={displayEvents}
          renderItem={({ item }) => <EventCardGrid event={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
    backgroundColor: Colors.base,
  },
  // Filter Section
  filterSection: {
    backgroundColor: Colors.base,
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[400],
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[600],
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  // List
  list: {
    padding: 12,
    paddingBottom: 100,
  },
  row: {
    gap: 12,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray[400],
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: "center",
  },
});
