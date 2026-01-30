import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { apis } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../../constants/Colors";

export default function NewTicketScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    durationMinutes: "60",
    sportType: "basketball",
    intensity: "Medium",
  });

  // Fetch venues on mount and when sport type changes
  useEffect(() => {
    fetchVenues();
  }, [formData.sportType]);

  const fetchVenues = async () => {
    setLoadingVenues(true);
    try {
      // Fetch venues filtered by sport type
      const data = await apis.venues.searchVenues({
        sportType: formData.sportType,
      });
      setVenues(data);
      // Clear selected venues that are no longer in the list
      setSelectedVenueIds((prev) =>
        prev.filter((id) => data.some((v) => v.venue.id === id)),
      );
    } catch (error) {
      console.error("Failed to fetch venues:", error);
      // Fallback to empty array if fetch fails
      setVenues([]);
      setSelectedVenueIds([]);
    } finally {
      setLoadingVenues(false);
    }
  };

  const toggleVenue = (venueId: string) => {
    setSelectedVenueIds((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId],
    );
  };

  const handleCreate = async () => {
    if (selectedVenueIds.length === 0) {
      alert("請至少選擇一個場地");
      return;
    }

    setLoading(true);
    try {
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = time.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      await apis.tickets.createTicket({
        ticketCreateIn: {
          date: new Date(dateStr),
          startTime: timeStr,
          durationMinutes: parseInt(formData.durationMinutes),
          sportType: formData.sportType,
          intensity: formData.intensity as any,
          venueIds: selectedVenueIds,
          currency: "USD",
        },
      });
      router.back();
    } catch (error) {
      console.error("Failed to create ticket:", error);
      alert("建立球票失敗");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>建立球票</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>日期</Text>
          {Platform.OS === "android" && (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          {(Platform.OS === "ios" || showDatePicker) && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>開始時間</Text>
          {Platform.OS === "android" && (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          )}
          {(Platform.OS === "ios" || showTimePicker) && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>時長 (分鐘)</Text>
          <TextInput
            style={styles.input}
            value={formData.durationMinutes}
            onChangeText={(text) =>
              setFormData({ ...formData, durationMinutes: text })
            }
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>運動類型</Text>
          <View style={styles.pills}>
            {["basketball", "badminton", "tennis", "soccer"].map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.pill,
                  formData.sportType === sport && styles.pillActive,
                ]}
                onPress={() => setFormData({ ...formData, sportType: sport })}
              >
                <Text
                  style={[
                    styles.pillText,
                    formData.sportType === sport && styles.pillTextActive,
                  ]}
                >
                  {sport === "basketball"
                    ? "籃球"
                    : sport === "badminton"
                      ? "羽球"
                      : sport === "tennis"
                        ? "網球"
                        : sport === "soccer"
                          ? "足球"
                          : sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>強度</Text>
          <View style={styles.pills}>
            {["Low", "Medium", "High"].map((intensity) => (
              <TouchableOpacity
                key={intensity}
                style={[
                  styles.pill,
                  formData.intensity === intensity && styles.pillActive,
                ]}
                onPress={() => setFormData({ ...formData, intensity })}
              >
                <Text
                  style={[
                    styles.pillText,
                    formData.intensity === intensity && styles.pillTextActive,
                  ]}
                >
                  {intensity === "Low"
                    ? "低"
                    : intensity === "Medium"
                      ? "中"
                      : intensity === "High"
                        ? "高"
                        : intensity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>場地 *</Text>
          {loadingVenues ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : venues.length === 0 ? (
            <Text style={styles.emptyText}>無可用場地</Text>
          ) : (
            <View style={styles.venueList}>
              {venues.map((venueData) => (
                <TouchableOpacity
                  key={venueData.venue.id}
                  style={[
                    styles.venueCard,
                    selectedVenueIds.includes(venueData.venue.id) &&
                      styles.venueCardSelected,
                  ]}
                  onPress={() => toggleVenue(venueData.venue.id)}
                >
                  <View style={styles.venueCardContent}>
                    <View style={styles.venueInfo}>
                      <Text
                        style={[
                          styles.venueName,
                          selectedVenueIds.includes(venueData.venue.id) &&
                            styles.venueNameSelected,
                        ]}
                      >
                        {venueData.venue.name}
                      </Text>
                      <Text style={styles.venueAddress}>
                        {venueData.venue.address}
                      </Text>
                    </View>
                    {selectedVenueIds.includes(venueData.venue.id) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.primary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedVenueIds.length > 0 && (
            <Text style={styles.selectedCount}>
              已選擇 {selectedVenueIds.length} 個場地
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "建立中..." : "建立球票"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[800],
    backgroundColor: Colors.base,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray[900],
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.gray[900],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.gray[100],
    color: Colors.gray[900],
  },
  dateButton: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.gray[100],
  },
  dateButtonText: {
    color: Colors.gray[900],
    fontSize: 16,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.gray[600],
  },
  pillTextActive: {
    color: Colors.gray[900],
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.gray[900],
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    color: Colors.gray[400],
    fontSize: 14,
    fontStyle: "italic",
  },
  venueList: {
    gap: 12,
  },
  venueCard: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    padding: 12,
    backgroundColor: Colors.white,
  },
  venueCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.secondary,
  },
  venueCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[900],
    marginBottom: 4,
  },
  venueNameSelected: {
    color: Colors.tertiary,
  },
  venueAddress: {
    fontSize: 14,
    color: Colors.gray[400],
  },
  selectedCount: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.tertiary,
    fontWeight: "500",
  },
});
