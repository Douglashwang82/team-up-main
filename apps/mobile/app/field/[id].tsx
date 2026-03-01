import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { Colors } from "../../constants/Colors";
import { getSportTypeColor, renderStars } from "../../utils/fieldHelpers";
import { apis } from "../../lib/api";
import { VenueDetail, CourtOut } from "@team-up-main/api-client";

export default function FieldDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVenue() {
      try {
        setLoading(true);
        const data = await apis.venues.getVenueById({ venueId: id as string });
        setVenue(data as VenueDetail);
      } catch (err: any) {
        setError(err.message || "Failed to load venue details");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchVenue();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !venue) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error[500]} />
          <Text style={styles.errorText}>{error || "找不到場地"}</Text>
          <Button title="返回" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  // Handle fallback or dynamic sport layout
  const sportType = venue.courts && venue.courts.length > 0 ? venue.courts[0].sportType || "籃球" : "籃球";
  const sportColor = getSportTypeColor(sportType);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <FieldMainCard venue={venue} sportColor={sportColor} sportType={sportType} />
        <FieldInfoCard venue={venue} />
        {/* If facilities exist, show them. For MVP we omit since it's not strictly on VenueDetail schema */}
        {/* <FieldFacilitiesCard facilities={["Parking", "Restrooms"]} /> */}
        <FieldCourtsCard courts={venue.courts || []} venueId={venue.id} router={router} />
      </ScrollView>

      <FieldFooter
        onCreateEvent={() =>
          router.push({
            pathname: "/(tabs)/new-teamup",
            params: { venueId: venue.id, venueName: venue.name },
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
function FieldMainCard({ venue, sportColor, sportType }: any) {
  return (
    <Card style={styles.mainCard}>
      <View style={styles.iconContainer}>
        <Text style={styles.fieldIcon}>🏢</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: sportColor.bg }]}>
        <Text style={[styles.badgeText, { color: sportColor.text }]}>
          {sportType}
        </Text>
      </View>

      <Text style={styles.title}>{venue.name}</Text>
      <Text style={styles.description}>{venue.description || "暫無簡介"}</Text>

      <View style={styles.ratingContainer}>
        <View style={styles.stars}>{renderStars(4.5)}</View>
        <Text style={styles.ratingText}>{"4.5"}</Text>
      </View>
    </Card>
  );
}

// Info Card Component
function FieldInfoCard({ venue }: any) {
  return (
    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>資訊</Text>

      <InfoRow icon="location-outline" label="地址" value={venue.address || "未知地址"} />

      <InfoRow
        icon="call-outline"
        label="聯絡電話"
        value={venue.contactPhone || "未提供"}
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

// Courts Card Component
function FieldCourtsCard({ courts, venueId, router }: any) {
  return (
    <Card style={styles.eventsCard}>
      <View style={styles.eventsHeader}>
        <Text style={styles.sectionTitle}>場內球場</Text>
        <Text style={styles.eventCount}>{courts.length}</Text>
      </View>

      {courts.length > 0 ? (
        <View style={styles.eventsList}>
          {courts.map((court: CourtOut) => (
            <CourtItem
              key={court.id}
              court={court}
              onPress={() => {
                // Feature for future: view specific court details/timeslots
              }}
            />
          ))}
        </View>
      ) : (
        <EmptyEvents text="此場地尚無設置球場" />
      )}
    </Card>
  );
}

function CourtItem({ court, onPress }: any) {
  return (
    <TouchableOpacity style={styles.eventItem} onPress={onPress} disabled={true}>
      <View style={styles.eventDateBadge}>
        <Ionicons name="basketball-outline" size={24} color={Colors.white} />
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{court.name}</Text>
        <View style={styles.eventMeta}>
          <View style={styles.eventMetaItem}>
            <Ionicons
              name="pricetag-outline"
              size={14}
              color={Colors.gray[400]}
            />
            <Text style={styles.eventMetaText}>
              {court.isFree ? "免費" : "需付費"}
            </Text>
          </View>
          <Text style={styles.eventMetaDivider}>•</Text>
          <Text style={styles.eventOrganizer}>{court.surfaceType || "室外/室內"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyEvents({ text }: { text: string }) {
  return (
    <View style={styles.emptyEvents}>
      <Ionicons name="alert-circle-outline" size={48} color={Colors.gray[600]} />
      <Text style={styles.emptyEventsText}>{text}</Text>
    </View>
  );
}

// Footer Component
function FieldFooter({ onCreateEvent, onViewMap }: any) {
  return (
    <View style={styles.footer}>
      <Button title="在此建立活動" onPress={onCreateEvent} fullWidth size="large" />
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray[500],
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
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
