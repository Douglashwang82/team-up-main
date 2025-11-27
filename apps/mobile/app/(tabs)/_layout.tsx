import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import NotificationCenter from '../../components/NotificationCenter';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.gray[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerShown: true,
        headerRight: () => <NotificationCenter />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'TeamUps',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-teamups"
        options={{
          title: 'My TeamUps',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="teamup"
        options={{
          href: null,
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
