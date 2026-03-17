import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform, Text, useColorScheme } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_WIDTH = SCREEN_WIDTH - 32;
const TAB_BAR_HEIGHT = 70;
const TAB_BAR_RADIUS = 28;

const ROUTE_ICONS: Record<string, { default: keyof typeof Ionicons.glyphMap; focused: keyof typeof Ionicons.glyphMap }> = {
    index: { default: "people-outline", focused: "people" },
    map: { default: "map-outline", focused: "map" },
    "event-create": { default: "add", focused: "add" },
    chat: { default: "chatbubbles-outline", focused: "chatbubbles" },
    "my-events": { default: "calendar-outline", focused: "calendar" },
    profile: { default: "person-outline", focused: "person" },
};

function TabButton({
    route,
    isFocused,
    onPress,
    onLongPress,
    theme
}: {
    route: string;
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
    theme: any;
}) {
    const scale = useSharedValue(1);
    const isTicketTab = route === "event-create";

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    React.useEffect(() => {
        scale.value = withSpring(isFocused ? 1.15 : 1, {
            damping: 12,
            stiffness: 200,
        });
    }, [isFocused]);

    const iconName = ROUTE_ICONS[route]?.[isFocused ? "focused" : "default"] || "ellipse";
    const baseIconColor = isFocused ? theme.activeIcon : theme.inactiveIcon;
    const fabIconColor = isTicketTab ? (theme.isDark ? '#000000' : '#FFFFFF') : baseIconColor;

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
        >
            <Animated.View
                style={[
                    animatedStyle,
                    isTicketTab && [styles.fabButton, { backgroundColor: theme.fabBg }],
                    isFocused && isTicketTab && [styles.focusedFabButton, { backgroundColor: theme.fabFocusedBg }],
                ]}
            >
                <Ionicons
                    name={iconName}
                    size={isTicketTab ? 40 : 30}
                    color={fabIconColor}
                />
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 16);

    // Dynamic Theme Hook
    const colorScheme = useColorScheme();
    const isDark = colorScheme !== 'light';

    const theme = {
        isDark,
        barBg: isDark ? 'rgba(20, 20, 25, 0.85)' : 'rgba(255, 255, 255, 0.95)',
        barBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        shadowColor: isDark ? '#000000' : '#888888',
        activeIcon: isDark ? '#F97316' : '#FF5500', // vibrant orange
        inactiveIcon: isDark ? '#6B7280' : '#9CA3AF',
        fabBg: isDark ? '#FFFFFF' : '#111827', // Contrast to bar background
        fabFocusedBg: isDark ? '#F97316' : '#FF5500',
    };

    const visibleRoutes = state.routes.filter((route) => {
        const options = descriptors[route.key]?.options;
        const hasIcon = ROUTE_ICONS[route.name] !== undefined;
        return (options as any)?.href !== null && hasIcon;
    });

    return (
        <View style={[styles.container, { paddingBottom: bottomPadding }]}>
            <View
                style={[
                    styles.canvasContainer,
                    {
                        backgroundColor: theme.barBg,
                        borderColor: theme.barBorder,
                        shadowColor: theme.shadowColor
                    }
                ]}
            />
            <View style={styles.tabsContainer}>
                {visibleRoutes.map((route) => {
                    const isFocused = state.index === state.routes.indexOf(route);
                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };
                    const onLongPress = () => {
                        navigation.emit({ type: "tabLongPress", target: route.key });
                    };

                    return (
                        <TabButton
                            key={route.key}
                            route={route.name}
                            isFocused={isFocused}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            theme={theme}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: -20,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: 16,
    },
    canvasContainer: {
        width: TAB_BAR_WIDTH,
        height: TAB_BAR_HEIGHT,
        borderRadius: TAB_BAR_RADIUS,
        overflow: "hidden",
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    tabsContainer: {
        position: "absolute",
        top: 0,
        left: 16,
        right: 16,
        opacity: 0.9,
        height: TAB_BAR_HEIGHT,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    tabButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    fabButton: {
        borderRadius: 24,
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "black",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    focusedFabButton: {
    },
});
