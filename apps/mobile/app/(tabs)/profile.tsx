import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { apis } from "../../lib/api";
import { styles } from "./profile.styles";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [createdCount, setCreatedCount] = useState<number>(0);
  const [joinedCount, setJoinedCount] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setIsLoadingStats(false);
      return;
    }
    setIsLoadingStats(true);
    try {
      const [created, joined] = await Promise.all([
        apis.events.getMyCreatedEvents(),
        apis.events.getMyJoinedEvents(),
      ]);
      setCreatedCount(created.length);
      setJoinedCount(joined.length);
    } catch (error) {
      console.warn("Failed to fetch profile stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [user]);

  // Refetch stats when the tab is focused (e.g. after creating/joining events)
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const menuItems = [
    {
      icon: "person-outline",
      title: "編輯個人資料",
      subtitle: "更新您的個人資訊",
      onPress: () => {
        router.push("/edit-profile");
      },
    },
    {
      icon: "notifications-outline",
      title: "通知設定",
      subtitle: "管理通知偏好",
      onPress: () => {
        Alert.alert("即將推出", "通知設定功能即將推出，敬請期待！");
      },
    },
    {
      icon: "shield-checkmark-outline",
      title: "隱私與安全",
      subtitle: "控制您的隱私設定",
      onPress: () => {
        Alert.alert("即將推出", "隱私與安全功能即將推出，敬請期待！");
      },
    },
    {
      icon: "help-circle-outline",
      title: "幫助與支援",
      subtitle: "取得幫助或聯繫客服",
      onPress: () => {
        Alert.alert("即將推出", "幫助與支援功能即將推出，敬請期待！");
      },
    },
  ];

  const handleLogout = async () => {
    await logout();
    // Navigation will be handled automatically by the root layout
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Card style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.name}>
              {user ? `${user.display_name}` : "使用者"}
            </Text>
            <Text style={styles.email}>
              {user?.email || ""}
            </Text>

            <View style={styles.stats}>
              <View style={styles.stat}>
                {isLoadingStats ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.statValue}>{createdCount}</Text>
                )}
                <Text style={styles.statLabel}>已建立</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                {isLoadingStats ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.statValue}>{joinedCount}</Text>
                )}
                <Text style={styles.statLabel}>已加入</Text>
              </View>
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>設定</Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={Colors.gray[700]}
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.gray[400]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="登出"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            style={styles.logoutButton}
          />

          <Text style={styles.version}>版本 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
