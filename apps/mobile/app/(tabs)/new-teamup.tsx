import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { Colors } from "../../constants/Colors";
import { apis } from "../../lib/api";

export default function NewTeamUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const venueId = params.venueId as string | undefined;
  const venueName = params.venueName as string | undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "請輸入標題";
    if (!description.trim()) newErrors.description = "請輸入描述";

    const parsedParticipants = parseInt(maxParticipants, 10);
    if (!maxParticipants || isNaN(parsedParticipants) || parsedParticipants < 2) {
      newErrors.maxParticipants = "至少需要 2 名參加者";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
          venueId: venueId, // Attach the venue ID directly
          durationType: "temporary",
          status: "open",
        },
      });

      Alert.alert("建立成功", "活動已成功發布！", [
        {
          text: "確定",
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      console.error("Failed to create event", e);
      Alert.alert("錯誤", "建立活動時發生問題，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={28} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>建立活動</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>基本資訊</Text>

          <Input
            label="標題"
            placeholder="例如：週末晨間籃球局"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />

          <Input
            label="描述"
            placeholder="請描述您的活動..."
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <Input
            label="最大參加人數"
            placeholder="例如：10"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            error={errors.maxParticipants}
            keyboardType="numeric"
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>設定</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <View style={styles.settingIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color={Colors.gray[700]}
                />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>私人活動</Text>
                <Text style={styles.settingSubtitle}>僅限受邀用戶加入</Text>
              </View>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{
                false: Colors.gray[300],
                true: Colors.primary[500],
              }}
              thumbColor={Colors.white}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>地點</Text>
          <TouchableOpacity style={styles.dateButton} disabled={!!venueName}>
            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.gray[600]}
            />
            <Text style={[styles.dateButtonText, venueName ? { color: Colors.primary[600], fontWeight: "600" } : {}]}>
              {venueName || "選擇場地"}
            </Text>
            {!venueName && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.gray[400]}
              />
            )}
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="建立活動"
          onPress={handleCreate}
          loading={loading}
          fullWidth
          size="large"
        />
      </View>
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
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
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[900],
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray[900],
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.gray[700],
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
});
