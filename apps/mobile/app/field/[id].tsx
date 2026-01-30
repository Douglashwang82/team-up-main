import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { Colors } from "../../constants/Colors";
import { MOCK_FIELDS, MOCK_EVENTS } from "../../constants/mockData";
import { getSportTypeColor, renderStars } from "../../utils/fieldHelpers";

export default function FieldDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const field = MOCK_FIELDS.find((f) => f.id === id) || MOCK_FIELDS[0];
  const upcomingEvents = MOCK_EVENTS.filter((event) => event.fieldId === id);
  const sportColor = getSportTypeColor(field.sportType);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <FieldMainCard field={field} sportColor={sportColor} />
        <FieldInfoCard field={field} />
        <FieldFacilitiesCard facilities={field.facilities} />
        <FieldEventsCard
          events={upcomingEvents}
          onEventPress={(eventId: string) => router.push(`/teamup/${eventId}`)}
        />
      </ScrollView>

      <FieldFooter
        onCreateEvent={() =>
          router.push({
            pathname: "/(tabs)/new-teamup",
            params: { fieldId: field.id, fieldName: field.name },
          })
        }
        onViewMap={() => router.back()}
      />
    </SafeAreaView>
  );
}

// Header Component
function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>場地詳情</Text>
      <View style={styles.headerRight} />
    </View>
  );
}

// Main Field Card Component
function FieldMainCard({ field, sportColor }: any) {
  return (
    <Card style={styles.mainCard}>
      <View style={styles.iconContainer}>
        <Text style={styles.fieldIcon}>{field.icon}</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: sportColor.bg }]}>
        <Text style={[styles.badgeText, { color: sportColor.text }]}>
          {field.sportType}
        </Text>
      </View>

      <Text style={styles.title}>{field.name}</Text>
      <Text style={styles.description}>{field.description}</Text>

      <View style={styles.ratingContainer}>
        <View style={styles.stars}>{renderStars(field.rating)}</View>
        <Text style={styles.ratingText}>{field.rating.toFixed(1)}</Text>
      </View>
    </Card>
  );
}

// Info Card Component
function FieldInfoCard({ field }: any) {
  return (
    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>資訊</Text>

      <InfoRow icon="location-outline" label="地址" value={field.address} />

      <InfoRow
        icon="time-outline"
        label="營業時間"
        value={field.openingHours}
      />
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={Colors.gray[400]} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// Facilities Card Component
function FieldFacilitiesCard({ facilities }: { facilities: string[] }) {
  return (
    <Card style={styles.facilitiesCard}>
      <Text style={styles.sectionTitle}>設施</Text>
      <View style={styles.facilitiesList}>
        {facilities.map((facility, index) => (
          <View key={index} style={styles.facilityItem}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.success[500]}
            />
            <Text style={styles.facilityText}>{facility}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

// Events Card Component
function FieldEventsCard({ events, onEventPress }: any) {
  return (
    <Card style={styles.eventsCard}>
      <View style={styles.eventsHeader}>
        <Text style={styles.sectionTitle}>即將舉行的活動</Text>
        <Text style={styles.eventCount}>{events.length}</Text>
      </View>

      {events.length > 0 ? (
        <View style={styles.eventsList}>
          {events.map((event: any) => (
            <EventItem
              key={event.id}
              event={event}
              onPress={() => onEventPress(event.id)}
            />
          ))}
        </View>
      ) : (
        <EmptyEvents />
      )}
    </Card>
  );
}

function EventItem({ event, onPress }: any) {
  return (
    <TouchableOpacity style={styles.eventItem} onPress={onPress}>
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDateDay}>{event.date.getDate()}</Text>
        <Text style={styles.eventDateMonth}>
          {event.date
            .toLocaleDateString("en-US", { month: "short" })
            .toUpperCase()}
        </Text>
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <View style={styles.eventMetaItem}>
            <Ionicons
              name="person-outline"
              size={14}
              color={Colors.gray[400]}
            />
            <Text style={styles.eventMetaText}>
              {event.participants}/{event.maxParticipants}
            </Text>
          </View>
          <Text style={styles.eventMetaDivider}>•</Text>
          <Text style={styles.eventOrganizer}>{event.organizer}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.gray[500]} />
    </TouchableOpacity>
  );
}

function EmptyEvents() {
  return (
    <View style={styles.emptyEvents}>
      <Ionicons name="calendar-outline" size={48} color={Colors.gray[600]} />
      <Text style={styles.emptyEventsText}>尚無即將舉行的活動</Text>
      <Text style={styles.emptyEventsSubtext}>成為第一個建立活動的人！</Text>
    </View>
  );
}

// Footer Component
function FieldFooter({ onCreateEvent, onViewMap }: any) {
  return (
    <View style={styles.footer}>
      <Button title="建立活動" onPress={onCreateEvent} fullWidth size="large" />
      <View style={styles.footerSpacer} />
      <Button
        title="在地圖上查看"
        onPress={onViewMap}
        fullWidth
        size="large"
        variant="outline"
      />
    </View>
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
    padding: 20,
  },
  mainCard: {
    marginBottom: 16,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  fieldIcon: {
    fontSize: 64,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray[900],
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.gray[600],
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[900],
  },
  infoCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray[900],
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.gray[900],
    fontWeight: "500",
  },
  facilitiesCard: {
    marginBottom: 16,
  },
  facilitiesList: {
    gap: 12,
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  facilityText: {
    fontSize: 16,
    color: Colors.gray[900],
  },
  eventsCard: {
    marginBottom: 16,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  eventCount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary[400],
    backgroundColor: Colors.primary[900],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  eventDateBadge: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary[600],
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.white,
    marginTop: -2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.gray[900],
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventMetaText: {
    fontSize: 13,
    color: Colors.gray[400],
  },
  eventMetaDivider: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  eventOrganizer: {
    fontSize: 13,
    color: Colors.gray[400],
  },
  emptyEvents: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyEventsText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray[400],
    marginTop: 12,
  },
  emptyEventsSubtext: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.base,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[800],
  },
  footerSpacer: {
    height: 12,
  },
});
