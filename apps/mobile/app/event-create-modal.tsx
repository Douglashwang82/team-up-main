import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@react-navigation/native";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Colors } from "../constants/Colors";
import { apis } from "../lib/api";
import { VenueOut, CourtOut, VenueDetail } from "@team-up-main/api-client";
import { getSportLabel } from "../constants/Categories";

export default function CreatePostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialVenueId = params.venueId as string | undefined;
  const initialVenueName = params.venueName as string | undefined;

  // === Event State ===
  const [selectedVenueId, setSelectedVenueId] = useState<string | undefined>(initialVenueId);
  const [selectedVenueName, setSelectedVenueName] = useState<string | undefined>(initialVenueName);
  const [selectedCourtId, setSelectedCourtId] = useState<string | undefined>(undefined);
  const [selectedCourtName, setSelectedCourtName] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [isPrivate, setIsPrivate] = useState(false);
  const [eventErrors, setEventErrors] = useState<Record<string, string>>({});

  // === Shared Modal State ===
  const [loading, setLoading] = useState(false);
  const [venueModalVisible, setVenueModalVisible] = useState(false);
  const [venues, setVenues] = useState<VenueOut[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [courtModalVisible, setCourtModalVisible] = useState(false);
  const [courts, setCourts] = useState<CourtOut[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(false);

  useEffect(() => {
    if (initialVenueId) {
      setSelectedVenueId(initialVenueId);
      setSelectedVenueName(initialVenueName);
      setEventErrors((prev) => ({ ...prev, venue: "" }));
    }
  }, [initialVenueId, initialVenueName]);

  // Event Court Fetching
  useEffect(() => {
    async function fetchCourts() {
      if (!selectedVenueId) {
        setCourts([]);
        setSelectedCourtId(undefined);
        setSelectedCourtName(undefined);
        return;
      }
      setLoadingCourts(true);
      try {
        const venueDetail = await apis.venues.getVenueById({ venueId: selectedVenueId }) as VenueDetail;
        setCourts(venueDetail.courts || []);
      } catch (e) {
        console.error("Failed to fetch courts:", e);
      } finally {
        setLoadingCourts(false);
      }
    }
    fetchCourts();
  }, [selectedVenueId]);

  const fetchVenues = async () => {
    setLoadingVenues(true);
    try {
      const resp = await apis.venues.searchVenues({});
      const data = (resp as unknown as import("@team-up-main/api-client").VenueSearchResult[]).map(r => r.venue);
      setVenues(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleCreateEvent = async () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "請輸入標題";
    if (!description.trim()) newErrors.description = "請輸入描述";

    const parsedParticipants = parseInt(maxParticipants, 10);
    if (!maxParticipants || isNaN(parsedParticipants) || parsedParticipants < 2) {
      newErrors.maxParticipants = "至少需要 2 名參加者";
    }

    if (!selectedVenueId) newErrors.venue = "請選擇場地";

    if (Object.keys(newErrors).length > 0) {
      setEventErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await apis.events.createEvent({
        eventCreateIn: {
          title: title.trim(),
          description: description.trim(),
          maxParticipants: parsedParticipants,
          visibility: isPrivate ? "private" : "public",
          venueId: selectedVenueId,
          courtId: selectedCourtId,
          durationType: "temporary",
          status: "open",
        },
      });

      Alert.alert("建立成功", "活動已成功發布！", [
        { text: "確定", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Failed to create event", e);
      Alert.alert("錯誤", "建立活動時發生問題，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const styles = getStyles(colors, dark);

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

      <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>基本資訊</Text>
            <Input
              label="標題"
              placeholder="例如：週末晨間籃球局"
              value={title}
              onChangeText={setTitle}
              error={eventErrors.title}
            />
            <Input
              label="描述"
              placeholder="請描述您的活動..."
              value={description}
              onChangeText={setDescription}
              error={eventErrors.description}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
            <Input
              label="最大參加人數"
              placeholder="例如：10"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              error={eventErrors.maxParticipants}
              keyboardType="numeric"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>設定</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Ionicons name="lock-closed-outline" size={24} color={Colors.gray[700]} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>私人活動</Text>
                  <Text style={styles.settingSubtitle}>僅限受邀用戶加入</Text>
                </View>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
                thumbColor={Colors.white}
              />
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>地點</Text>
            <TouchableOpacity
              style={[styles.dateButton, eventErrors.venue && { borderColor: Colors.error[500] }]}
              onPress={() => {
                setVenueModalVisible(true);
                if (venues.length === 0) fetchVenues();
              }}
              disabled={!!initialVenueName}
            >
              <Ionicons name="location-outline" size={20} color={selectedVenueName ? Colors.primary[600] : Colors.gray[600]} />
              <Text style={[styles.dateButtonText, selectedVenueName && { color: Colors.primary[600], fontWeight: "600" }]}>
                {selectedVenueName || "選擇場地"}
              </Text>
              {!initialVenueName && <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />}
            </TouchableOpacity>
            {eventErrors.venue && <Text style={styles.errorText}>{eventErrors.venue}</Text>}

            {selectedVenueId && (
              <TouchableOpacity style={[styles.dateButton, { marginTop: 12 }]} onPress={() => setCourtModalVisible(true)}>
                <Ionicons name="basketball-outline" size={20} color={selectedCourtName ? Colors.primary[600] : Colors.gray[600]} />
                <Text style={[styles.dateButtonText, selectedCourtName && { color: Colors.primary[600], fontWeight: "600" }]}>
                  {selectedCourtName || "選擇場內球場 (選填)"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
              </TouchableOpacity>
            )}
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          <Button
            title={"發布活動"}
            onPress={handleCreateEvent}
            loading={loading}
            fullWidth
            size="large"
          />
        </View>
      </View>

      {/* Shared Modals for Event */}
      {
        courtModalVisible && (
          <View style={[StyleSheet.absoluteFill, styles.fullModalOverlay]}>
            <View style={styles.fullModalContent}>
              <View style={styles.fullModalHeader}>
                <Text style={styles.fullModalTitle}>選擇球場</Text>
                <TouchableOpacity onPress={() => setCourtModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
              </View>
              <ScrollView style={styles.fullModalScroll}>
                {loadingCourts ? <Text style={styles.fullModalLoading}>載入中...</Text> : courts.length === 0 ? <Text style={styles.fullModalLoading}>此場地無特定球場可選</Text> : (
                  <>
                    <TouchableOpacity style={styles.fullModalItem} onPress={() => { setSelectedCourtId(undefined); setSelectedCourtName(undefined); setCourtModalVisible(false); }}>
                      <Ionicons name="close-circle-outline" size={20} color={Colors.gray[400]} />
                      <View style={{ marginLeft: 12 }}><Text style={styles.fullModalName}>不指定球場</Text></View>
                    </TouchableOpacity>
                    {courts.map((c) => (
                      <TouchableOpacity key={c.id} style={styles.fullModalItem} onPress={() => { setSelectedCourtId(c.id); setSelectedCourtName(c.name); setCourtModalVisible(false); }}>
                        <Ionicons name="basketball" size={20} color={selectedCourtId === c.id ? Colors.primary[600] : Colors.gray[400]} />
                        <View style={{ marginLeft: 12 }}>
                          <Text style={[styles.fullModalName, selectedCourtId === c.id && { color: Colors.primary[600] }]}>{c.name}</Text>
                          <Text style={styles.fullModalAddress}>{c.sportType || "籃球"}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        )
      }

      {
        venueModalVisible && (
          <View style={[StyleSheet.absoluteFill, styles.fullModalOverlay]}>
            <View style={styles.fullModalContent}>
              <View style={styles.fullModalHeader}>
                <Text style={styles.fullModalTitle}>選擇場地</Text>
                <TouchableOpacity onPress={() => setVenueModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
              </View>
              <ScrollView style={styles.fullModalScroll}>
                {loadingVenues ? <Text style={styles.fullModalLoading}>載入中...</Text> : venues.length === 0 ? <Text style={styles.fullModalLoading}>暫無場地</Text> : (
                  venues.map((v) => (
                    <TouchableOpacity key={v.id} style={styles.fullModalItem} onPress={() => { setSelectedVenueId(v.id); setSelectedVenueName(v.name); setVenueModalVisible(false); setEventErrors((prev) => ({ ...prev, venue: "" })); }}>
                      <Ionicons name="location" size={20} color={Colors.gray[400]} />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.fullModalName}>{v.name}</Text>
                        <Text style={styles.fullModalAddress}>{v.address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )
      }
    </View >
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: colors.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    height: "88%", borderWidth: 1, borderColor: colors.border,
    overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backButton: { padding: 4 },
  headerToggle: {
    flexDirection: 'row', backgroundColor: colors.pillBg, borderRadius: 20, padding: 4, width: 200,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : Colors.white,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  toggleText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  toggleTextActive: { color: colors.text, fontWeight: '700' },
  headerRight: { width: 36 },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 12 },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  settingContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  settingIcon: { marginRight: 12 },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: "500", color: colors.text, marginBottom: 2 },
  settingSubtitle: { fontSize: 12, color: colors.textSecondary },
  dateButton: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: colors.inputBg, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder },
  dateButtonText: { flex: 1, fontSize: 16, color: colors.text, marginLeft: 12 },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: "transparent", overflow: "hidden" },
  errorText: { color: Colors.error[500], fontSize: 12, marginTop: 8, marginLeft: 4 },
  ticketInputGroup: { marginBottom: 16 },
  ticketLabel: { fontSize: 14, fontWeight: "500", color: colors.textSecondary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: colors.inputBg, color: colors.text },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder },
  pillActive: { backgroundColor: Colors.primary + "15", borderColor: Colors.primary },
  pillText: { color: colors.textSecondary, fontWeight: "500" },
  pillTextActive: { color: Colors.primary, fontWeight: "600" },
  emptyText: { color: colors.textSecondary, fontSize: 14, fontStyle: "italic" },
  venueList: { gap: 12 },
  venueCard: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, padding: 16, backgroundColor: colors.inputBg },
  venueCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + "05" },
  venueCardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  venueInfo: { flex: 1 },
  ticketVenueName: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 4 },
  ticketVenueNameSelected: { color: Colors.primary },
  ticketVenueAddress: { fontSize: 13, color: colors.textSecondary },
  fullModalOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 100 },
  fullModalContent: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  fullModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  fullModalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  fullModalScroll: { padding: 16 },
  fullModalLoading: { textAlign: 'center', color: colors.textSecondary, marginTop: 20 },
  fullModalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  fullModalName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  fullModalAddress: { fontSize: 13, color: colors.textSecondary },
});
