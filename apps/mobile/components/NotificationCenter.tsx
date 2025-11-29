import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apis } from '../lib/api';
import { NotificationOut } from '@team-up-main/api-client';
import { useAuth } from '../lib/AuthContext';

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<NotificationOut[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const data = await apis.notifications.listNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await apis.notifications.markNotificationAsRead({ notificationId: id });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationPress = async (notification: NotificationOut) => {
        if (notification.type === 'match_found' && notification.relatedEntityId) {
            Alert.alert(
                "Match Found!",
                "Do you want to join this event?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Join",
                        onPress: async () => {
                            try {
                                await apis.teamups.joinTeamup({
                                    teamupId: notification.relatedEntityId!,
                                    joinRequestCreateIn: { message: "Joined via match notification" }
                                });
                                Alert.alert("Success", "You have joined the event!");
                                markAsRead(notification.id);
                                setModalVisible(false);
                            } catch (error) {
                                console.error('Failed to join teamup', error);
                                Alert.alert("Error", "Failed to join event. It might be full or you already joined.");
                            }
                        }
                    }
                ]
            );
        } else {
            markAsRead(notification.id);
        }
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.iconButton}
            >
                <Ionicons name="notifications-outline" size={24} color="#333" />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notifications</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {notifications.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No notifications</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={notifications}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.notificationItem,
                                            !item.isRead && styles.unreadItem
                                        ]}
                                        onPress={() => handleNotificationPress(item)}
                                    >
                                        <Text style={styles.message}>{item.message}</Text>
                                        <Text style={styles.time}>
                                            {new Date(item.createdAt).toLocaleString()}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        padding: 8,
        marginRight: 8,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'red',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    notificationItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    unreadItem: {
        backgroundColor: '#f0f9ff',
    },
    message: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
});
