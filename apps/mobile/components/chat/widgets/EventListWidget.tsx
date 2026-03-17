import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useEvents } from '../../../hooks/useEvents';
import EventCard from '../../events/EventCard';

export default function EventListWidget() {
    const { colors } = useTheme();
    // Simulate fetching the events with the hook (usually we'd read data from the AI widget payload)
    const { events, isLoading, loadEvents } = useEvents();

    useEffect(() => {
        loadEvents();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: (colors as any).border }]}>
            <View style={[styles.header, { borderBottomColor: (colors as any).border }]}>
                <Ionicons name="calendar" size={18} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>最新活動推薦</Text>
            </View>
            <View style={styles.listContainer}>
                {isLoading ? (
                    <ActivityIndicator style={{ padding: 30 }} color={colors.primary} />
                ) : events.length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: (colors as any).textSecondary }}>附近暫無活動</Text>
                    </View>
                ) : (
                    <View style={{ padding: 12 }}>
                        {events.slice(0, 2).map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} compact={true} />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
    },
    listContainer: {
        minHeight: 100,
        backgroundColor: 'rgba(0,0,0,0.02)',
    }
});
