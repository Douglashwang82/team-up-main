import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventOut } from "@team-up-main/api-client";
import { Calendar, LocaleConfig } from "react-native-calendars";
import EventCard from "../components/events/EventCard";
import { Colors } from "../constants/Colors";
import { apis } from "../lib/api";

// Configure Calendar locale (Chinese)
LocaleConfig.locales["tw"] = {
  monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
  dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
  today: "今天"
};
LocaleConfig.defaultLocale = "tw";

type FilterType = "upcoming" | "completed" | "pending-requests";
type ViewMode = "list" | "calendar";

export default function MyEventsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<EventOut[]>([]);
  const [completedEvents, setCompletedEvents] = useState<EventOut[]>([]);
  const [pendingRequests, setPendingRequests] = useState<EventOut[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("upcoming");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );


  // Fetch joined events and separate by upcoming/completed
  const fetchJoinedEventsAndProcess = async () => {
    try {
      const data = await apis.events.getMyJoinedEvents();
      const now = new Date();

      const upcoming: EventOut[] = [];
      const completed: EventOut[] = [];

      data.forEach(event => {
        // Simple logic: if closed -> completed
        if (event.status === 'closed') {
          completed.push(event);
        } else {
          // Check if any bookings are in the future
          let isUpcoming = false;
          if (event.bookings && event.bookings.length > 0) {
            isUpcoming = event.bookings.some(booking => {
              if (booking.timeSlot && booking.timeSlot.startsAt) {
                const bookingDate = new Date(booking.timeSlot.startsAt);
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const bDate = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
                return bDate >= today;
              }
              return false;
            });
          } else {
            // Temporary events with no bookings but still 'open' might be upcoming
            isUpcoming = true;
          }

          if (isUpcoming) {
            upcoming.push(event);
          } else {
            completed.push(event);
          }
        }
      });

      setUpcomingEvents(upcoming);
      setCompletedEvents(completed);
    } catch (error) {
      console.error("Failed to fetch joined events:", error);
    }
  };

  // Fetch pending events (pending join requests)
  const fetchPendingRequests = async () => {
    try {
      const data = await apis.events.getMyPendingEvents();
      setPendingRequests(data);
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    }
  };

  // Load data when filter changes
  useEffect(() => {
    setIsLoading(true);

    if (activeFilter === "upcoming" || activeFilter === "completed") {
      fetchJoinedEventsAndProcess().finally(() => setIsLoading(false));
    } else if (activeFilter === "pending-requests") {
      fetchPendingRequests().finally(() => setIsLoading(false));
    }
  }, [activeFilter]);

  // Get display items based on active filter
  const getDisplayItems = () => {
    switch (activeFilter) {
      case "upcoming":
        return upcomingEvents;
      case "completed":
        return completedEvents;
      case "pending-requests":
        return pendingRequests;
      default:
        return [];
    }
  };

  const displayItems = getDisplayItems();

  // Filter options
  const filters: { key: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "upcoming", label: "已加入(即將到來)", icon: "calendar-outline" },
    { key: "completed", label: "已加入(已結束)", icon: "checkmark-done-circle-outline" },
    { key: "pending-requests", label: "等待審核", icon: "time-outline" },
  ];

  const getEmptyMessage = () => {
    switch (activeFilter) {
      case "upcoming":
        return {
          title: "尚無即將到來的活動",
          subtitle: "瀏覽活動並加入感興趣的組團！",
        };
      case "completed":
        return {
          title: "尚無已結束的活動",
          subtitle: "您的歷史記錄將顯示於此！",
        };
      case "pending-requests":
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

  const renderEventItem = React.useCallback(({ item, index }: any) => (
    <EventCard event={item as EventOut} index={index} scrollY={0} />
  ), []);

  // Combine all events for the calendar view
  const allEventsForCalendar = React.useMemo(() => {
    // We can deduplicate if needed, but since they are from different buckets they should be mostly unique,
    // except maybe if an event is in multiple lists (which shouldn't happen based on fetch logic).
    // Let's just combine them and filter unique.
    const combined = [...upcomingEvents, ...completedEvents, ...pendingRequests];
    const uniqueIds = new Set();
    return combined.filter(event => {
      if (!uniqueIds.has(event.id)) {
        uniqueIds.add(event.id);
        return true;
      }
      return false;
    });
  }, [upcomingEvents, completedEvents, pendingRequests]);

  // Generate marked dates for the calendar
  const getMarkedDates = () => {
    const marks: any = {};

    // Map all events to the calendar
    allEventsForCalendar.forEach(event => {
      if (event.bookings && event.bookings.length > 0) {
        event.bookings.forEach(booking => {
          if (booking.timeSlot && booking.timeSlot.startsAt) {
            const startsAt = booking.timeSlot.startsAt as any;
            const dateStr = typeof startsAt === 'string'
              ? startsAt.split('T')[0]
              : startsAt.toISOString().split('T')[0];

            // Decide dot color. E.g. gray for completed, primary for upcoming
            // Since we combined them, we can check the event status or we can just use primary for all.
            // Let's use primary for open events and gray for closed/pending.
            let dotColor = Colors.primary;
            if (event.status === 'closed') {
              dotColor = Colors.gray[400];
            }

            marks[dateStr] = {
              marked: true,
              dotColor: dotColor
            };
          }
        });
      }
    });

    // Add selected date highlighting
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: Colors.primary };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: Colors.primary };
    }

    return marks;
  };

  const markedDates = getMarkedDates();

  // Get events for the selected date
  const eventsForSelectedDate = allEventsForCalendar.filter(event => {
    if (!event.bookings || event.bookings.length === 0) return false;
    return event.bookings.some(booking => {
      if (booking.timeSlot && booking.timeSlot.startsAt) {
        const startsAt = booking.timeSlot.startsAt as any;
        const dateStr = typeof startsAt === 'string'
          ? startsAt.split('T')[0]
          : startsAt.toISOString().split('T')[0];
        return dateStr === selectedDate;
      }
      return false;
    });
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的活動</Text>

        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list-outline"
              size={20}
              color={viewMode === 'list' ? Colors.white : Colors.gray[500]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={viewMode === 'calendar' ? Colors.white : Colors.gray[500]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips - Only show in list view */}
      {viewMode === 'list' && (
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
      )}

      {/* Divider Line */}
      <View style={styles.divider} />

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>正在載入...</Text>
        </View>
      ) : viewMode === 'calendar' ? (
        <ScrollView style={styles.calendarScroll}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: any) => {
              setSelectedDate(day.dateString);
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: Colors.base,
              calendarBackground: Colors.white,
              textSectionTitleColor: Colors.gray[600],
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.white,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.gray[900],
              textDisabledColor: Colors.gray[300],
              dotColor: Colors.primary,
              selectedDotColor: Colors.white,
              arrowColor: Colors.primary,
              monthTextColor: Colors.gray[900],
              indicatorColor: Colors.primary,
            }}
            style={styles.calendar}
          />
          {eventsForSelectedDate.length > 0 ? (
            <View style={styles.selectedDateEventsContainer}>
              <Text style={styles.selectedDateTitle}>
                {selectedDate} 的活動
              </Text>
              {eventsForSelectedDate.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} scrollY={0} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyDateContainer}>
              <Text style={styles.emptyDateText}>當天沒有相關活動</Text>
            </View>
          )}
        </ScrollView>
      ) : displayItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={'calendar-outline'}
            size={80}
            color={Colors.gray[400]}
          />
          <Text style={styles.emptyTitle}>{emptyMessage.title}</Text>
          <Text style={styles.emptySubtitle}>{emptyMessage.subtitle}</Text>
        </View>
      ) : (
        <FlatList
          data={displayItems as any[]}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
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
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray[900],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
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
  // View Toggle
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  // Calendar View
  calendarScroll: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  calendar: {
    marginBottom: 16,
  },
  selectedDateEventsContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[900],
    marginBottom: 12,
  },
  emptyDateContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDateText: {
    fontSize: 14,
    color: Colors.gray[500],
  },
});

