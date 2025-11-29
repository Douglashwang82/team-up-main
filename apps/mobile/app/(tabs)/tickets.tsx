import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { TicketOut } from '@team-up-main/api-client';
import { apis } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function TicketsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTickets = async () => {
        try {
            const data = await apis.tickets.listTickets();
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    const renderItem = ({ item }: { item: TicketOut }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.sportType}>{item.sportType}</Text>
                <View style={[
                    styles.statusBadge,
                    item.status === 'matched' ? styles.statusMatched :
                        item.status === 'expired' ? styles.statusExpired : styles.statusOpen
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.status === 'matched' ? styles.textMatched :
                            item.status === 'expired' ? styles.textExpired : styles.textOpen
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.date.toLocaleDateString()}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.startTime}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="fitness-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.intensity}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.title}>My Tickets</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/tickets/new')}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <Text>Loading...</Text>
                </View>
            ) : tickets.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No tickets found</Text>
                    <Text style={styles.emptySubText}>Create a ticket to find a match!</Text>
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    createButton: {
        backgroundColor: '#2563eb',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sportType: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusOpen: {
        backgroundColor: '#dbeafe',
    },
    statusMatched: {
        backgroundColor: '#dcfce7',
    },
    statusExpired: {
        backgroundColor: '#f3f4f6',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    textOpen: {
        color: '#1e40af',
    },
    textMatched: {
        color: '#166534',
    },
    textExpired: {
        color: '#374151',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 4,
        color: '#666',
        fontSize: 14,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    emptySubText: {
        marginTop: 8,
        color: '#666',
    },
});
