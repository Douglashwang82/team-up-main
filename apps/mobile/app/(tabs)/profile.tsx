import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../lib/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: "person-outline",
      title: "編輯個人資料",
      subtitle: "更新您的個人資訊",
      onPress: () => {
        // TODO: Navigate to edit profile
      },
    },
    {
      icon: "notifications-outline",
      title: "通知設定",
      subtitle: "管理通知偏好",
      onPress: () => {
        // TODO: Navigate to notifications settings
      },
    },
    {
      icon: "shield-checkmark-outline",
      title: "隱私與安全",
      subtitle: "控制您的隱私設定",
      onPress: () => {
        // TODO: Navigate to privacy settings
      },
    },
    {
      icon: "help-circle-outline",
      title: "幫助與支援",
      subtitle: "取得幫助或聯繫客服",
      onPress: () => {
        // TODO: Navigate to help
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
              {user ? `${user.display_name}` : "John Doe"}
            </Text>
            <Text style={styles.email}>
              {user?.email || "john.doe@example.com"}
            </Text>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>已建立</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>12</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.base,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.gray[900],
  },
  content: {
    padding: 20,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    marginBottom: 24,
    borderColor: Colors.gray[200],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.gray[900],
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 20,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    width: "100%",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray[200],
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[800],
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  menuIcon: {
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[900],
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  logoutButton: {
    marginBottom: 16,
    borderColor: Colors.error[500],
  },
  version: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: "center",
  },
});
