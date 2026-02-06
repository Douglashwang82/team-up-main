import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/Colors";
import { useFonts, NotoSansTC_400Regular, NotoSansTC_500Medium, NotoSansTC_700Bold } from '@expo-google-fonts/noto-sans-tc';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="event/[id]"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="field/[id]"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="teamup/[id]"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ticket/[id]"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="tickets/new"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSansTC_400Regular,
    NotoSansTC_500Medium,
    NotoSansTC_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.modern.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
