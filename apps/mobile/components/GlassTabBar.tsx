import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { Colors } from "../constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_WIDTH = SCREEN_WIDTH - 32;
const TAB_BAR_HEIGHT = 70;
const TAB_BAR_RADIUS = 28;

// Icon mapping for each route
const ROUTE_ICONS: Record<string, { default: keyof typeof Ionicons.glyphMap; focused: keyof typeof Ionicons.glyphMap }> = {
    index: { default: "people-outline", focused: "people" },
    map: { default: "map-outline", focused: "map" },
    tickets: { default: "add", focused: "add" },
    "my-events": { default: "calendar-outline", focused: "calendar" },
    profile: { default: "person-outline", focused: "person" },
};

const ROUTE_LABELS: Record<string, string> = {
    index: "Events",
    map: "Map",
    tickets: "",
    "my-events": "My Events",
    profile: "Profile",
};

// Animated Tab Button
function TabButton({
    route,
    isFocused,
    onPress,
    onLongPress,
}: {
    route: string;
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
}) {
    const scale = useSharedValue(1);
    const isTicketTab = route === "tickets";

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
    const iconColor = isFocused ? '#ff3b00' : Colors.gray[400];

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
        >
            {isTicketTab && (
                <Animated.View
                    style={[
                        animatedStyle,
                        styles.fabGlassBacking,
                    ]}
                >
                </Animated.View>
            )
            }
            <Animated.View
                style={[
                    animatedStyle,
                    isTicketTab && styles.fabButton,
                    isFocused && isTicketTab && styles.focusedFabButton,
                ]}
            >
                <Ionicons
                    name={iconName}
                    size={isTicketTab ? 40 : 30}
                    color={isFocused ? isTicketTab ? "white" : Colors.primary : Colors.gray[400]}
                />
            </Animated.View>
            {/* {
                !isTicketTab && (
                    <Text style={[
                        styles.label,
                        { color: isFocused ? Colors.primary : Colors.gray[400] }
                    ]}>
                        {ROUTE_LABELS[route]}
                    </Text>
                )
            } */}
        </TouchableOpacity >
    );
}

export default function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 16);

    // Filter out hidden routes (href: null) or routes without defined icons
    const visibleRoutes = state.routes.filter((route) => {
        const options = descriptors[route.key]?.options;
        const hasIcon = ROUTE_ICONS[route.name] !== undefined;
        return (options as any)?.href !== null && hasIcon;
    });

    // const TAB_WIDTH = (TAB_BAR_WIDTH - 32) / visibleRoutes.length; // 32 is padding (16*2)
    // const translateX = useSharedValue(0);
    // const focusedRouteKey = state.routes[state.index].key;
    // const activeIndex = visibleRoutes.findIndex(r => r.key === focusedRouteKey);

    // React.useEffect(() => {
    //     if (activeIndex !== -1) {
    //         translateX.value = withSpring(activeIndex * TAB_WIDTH, {
    //             damping: 15,
    //             stiffness: 150,
    //         });
    //     }
    // }, [activeIndex, TAB_WIDTH]);

    // const animatedBubbleStyle = useAnimatedStyle(() => ({
    //     transform: [{ translateX: translateX.value }],
    // }));

    return (
        <View style={[styles.container, { paddingBottom: bottomPadding }]}>
            {/* Glass Background */}
            <GlassView
                style={styles.canvasContainer}
                glassEffectStyle="clear"
            />

            {/* Tab Buttons */}
            <View style={styles.tabsContainer}>
                {/* Animated Bubble Removed */}
                {visibleRoutes.map((route, index) => {
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
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        });
                    };

                    return (
                        <TabButton
                            key={route.key}
                            route={route.name}
                            isFocused={isFocused}
                            onPress={onPress}
                            onLongPress={onLongPress}
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
        bottom: 0,
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
        borderColor: "rgba(255, 255, 255, 0.4)",
        backgroundColor: "rgba(12, 10, 10, 0.1)",
        // Premium glass shadow
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
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
        opacity: 0.8,
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
        backgroundColor: Colors.gray[200],
        borderRadius: 24,
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 0,
        ...Platform.select({
            ios: {
                shadowColor: Colors.primary,
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
        backgroundColor: Colors.primary,
    },
    fabGlassBacking: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 24,
        opacity: 0.,
        top: 7, // Aligned with FAB (-9) + offset (8) = -1
        alignSelf: 'center',
        overflow: 'hidden',
        zIndex: -10,
    },
    label: {
        fontSize: 10,
        fontWeight: "600",
        marginTop: 2,
    },

});
