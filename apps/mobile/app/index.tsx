import { Redirect } from "expo-router";
import { useAuth } from "../lib/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/Colors";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.gray[50],
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated, otherwise to tabs
  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}
