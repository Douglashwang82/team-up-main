import { Tabs, router } from "expo-router";
import { Colors } from "../../constants/Colors";
import NotificationCenter from "../../components/layout/NotificationCenter";
import GlassTabBar from "../../components/layout/GlassTabBar";

export default function TabLayout() {
  const handleCreatePostPress = (e: any) => {
    e.preventDefault();
    router.push("/event-create-modal");
  };
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[500],
        headerShown: true,
        headerStyle: {
          backgroundColor: "#fbe2e2ff",
        },
        headerTintColor: Colors.gray[900],
        headerRight: () => <NotificationCenter />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "活動列表",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "地圖搜尋",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI 助理",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="event-create" // Renamed from create-post
        options={{
          title: "建立",
        }}
        listeners={({ navigation }) => ({
          tabPress: handleCreatePostPress, // Updated to use the new handler
        })}
      />
      <Tabs.Screen
        name="my-events"
        options={{
          title: "我的活動",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "個人檔案",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
