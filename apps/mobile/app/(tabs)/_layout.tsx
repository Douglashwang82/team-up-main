import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import NotificationCenter from "../../components/NotificationCenter";
import GlassTabBar from "../../components/GlassTabBar";

export default function TabLayout() {
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
        animation: "shift",
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
        name="tickets"
        options={{
          title: "發起揪團",
          headerShown: false,
        }}
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
      <Tabs.Screen
        name="new-teamup"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
