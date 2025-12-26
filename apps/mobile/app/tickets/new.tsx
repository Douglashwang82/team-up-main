import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { apis } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';

export default function NewTicketScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingVenues, setLoadingVenues] = useState(true);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [venues, setVenues] = useState<any[]>([]);
    const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        durationMinutes: '60',
        sportType: 'basketball',
        intensity: 'Medium',
    });

    // Fetch venues on mount and when sport type changes
    useEffect(() => {
        fetchVenues();
    }, [formData.sportType]);

    const fetchVenues = async () => {
        setLoadingVenues(true);
        try {
            // Fetch venues filtered by sport type
            const data = await apis.venues.searchVenues({ sportType: formData.sportType });
            setVenues(data);
            // Clear selected venues that are no longer in the list
            setSelectedVenueIds(prev =>
                prev.filter(id => data.some(v => v.venue.id === id))
            );
        } catch (error) {
            console.error('Failed to fetch venues:', error);
            // Fallback to empty array if fetch fails
            setVenues([]);
            setSelectedVenueIds([]);
        } finally {
            setLoadingVenues(false);
        }
    };

    const toggleVenue = (venueId: string) => {
        setSelectedVenueIds(prev =>
            prev.includes(venueId)
                ? prev.filter(id => id !== venueId)
                : [...prev, venueId]
        );
    };

    const handleCreate = async () => {
        if (selectedVenueIds.length === 0) {
            alert('Please select at least one venue');
            return;
        }

        setLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

            await apis.tickets.createTicket({
                ticketCreateIn: {
                    date: new Date(dateStr),
                    startTime: timeStr,
                    durationMinutes: parseInt(formData.durationMinutes),
                    sportType: formData.sportType,
                    intensity: formData.intensity as any,
                    venueIds: selectedVenueIds,
                    currency: 'USD',
                }
            });
            router.back();
        } catch (error) {
            console.error('Failed to create ticket:', error);
            alert('Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.title}>New Ticket</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date</Text>
                    {Platform.OS === 'android' && (
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    )}
                    {(Platform.OS === 'ios' || showDatePicker) && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Start Time</Text>
                    {Platform.OS === 'android' && (
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    )}
                    {(Platform.OS === 'ios' || showTimePicker) && (
                        <DateTimePicker
                            value={time}
                            mode="time"
                            display="default"
                            onChange={onTimeChange}
                        />
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Duration (minutes)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.durationMinutes}
                        onChangeText={(text) => setFormData({ ...formData, durationMinutes: text })}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sport Type</Text>
                    <View style={styles.pills}>
                        {['basketball', 'badminton', 'tennis', 'soccer'].map((sport) => (
                            <TouchableOpacity
                                key={sport}
                                style={[
                                    styles.pill,
                                    formData.sportType === sport && styles.pillActive
                                ]}
                                onPress={() => setFormData({ ...formData, sportType: sport })}
                            >
                                <Text style={[
                                    styles.pillText,
                                    formData.sportType === sport && styles.pillTextActive
                                ]}>
                                    {sport}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Intensity</Text>
                    <View style={styles.pills}>
                        {['Low', 'Medium', 'High'].map((intensity) => (
                            <TouchableOpacity
                                key={intensity}
                                style={[
                                    styles.pill,
                                    formData.intensity === intensity && styles.pillActive
                                ]}
                                onPress={() => setFormData({ ...formData, intensity })}
                            >
                                <Text style={[
                                    styles.pillText,
                                    formData.intensity === intensity && styles.pillTextActive
                                ]}>
                                    {intensity}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venues *</Text>
                    {loadingVenues ? (
                        <ActivityIndicator size="small" color={Colors.primary[600]} />
                    ) : venues.length === 0 ? (
                        <Text style={styles.emptyText}>No venues available</Text>
                    ) : (
                        <View style={styles.venueList}>
                            {venues.map((venueData) => (
                                <TouchableOpacity
                                    key={venueData.venue.id}
                                    style={[
                                        styles.venueCard,
                                        selectedVenueIds.includes(venueData.venue.id) && styles.venueCardSelected
                                    ]}
                                    onPress={() => toggleVenue(venueData.venue.id)}
                                >
                                    <View style={styles.venueCardContent}>
                                        <View style={styles.venueInfo}>
                                            <Text style={[
                                                styles.venueName,
                                                selectedVenueIds.includes(venueData.venue.id) && styles.venueNameSelected
                                            ]}>
                                                {venueData.venue.name}
                                            </Text>
                                            <Text style={styles.venueAddress}>{venueData.venue.address}</Text>
                                        </View>
                                        {selectedVenueIds.includes(venueData.venue.id) && (
                                            <Ionicons name="checkmark-circle" size={24} color={Colors.primary[600]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    {selectedVenueIds.length > 0 && (
                        <Text style={styles.selectedCount}>
                            {selectedVenueIds.length} venue{selectedVenueIds.length > 1 ? 's' : ''} selected
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Creating...' : 'Create Ticket'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray[900],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[800],
        backgroundColor: Colors.gray[900],
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: Colors.white,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.gray[700],
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: Colors.gray[800],
        color: Colors.white,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: Colors.gray[700],
        borderRadius: 8,
        padding: 12,
        backgroundColor: Colors.gray[800],
    },
    dateButtonText: {
        color: Colors.white,
        fontSize: 16,
    },
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.gray[800],
        borderWidth: 1,
        borderColor: Colors.gray[700],
    },
    pillActive: {
        backgroundColor: Colors.primary[600],
        borderColor: Colors.primary[600],
    },
    pillText: {
        color: Colors.gray[300],
    },
    pillTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: Colors.primary[600],
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        color: Colors.gray[400],
        fontSize: 14,
        fontStyle: 'italic',
    },
    venueList: {
        gap: 12,
    },
    venueCard: {
        borderWidth: 1,
        borderColor: Colors.gray[700],
        borderRadius: 12,
        padding: 12,
        backgroundColor: Colors.gray[800],
    },
    venueCardSelected: {
        borderColor: Colors.primary[600],
        borderWidth: 2,
        backgroundColor: Colors.primary[900],
    },
    venueCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    venueInfo: {
        flex: 1,
    },
    venueName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
        marginBottom: 4,
    },
    venueNameSelected: {
        color: Colors.primary[400],
    },
    venueAddress: {
        fontSize: 14,
        color: Colors.gray[400],
    },
    selectedCount: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.primary[400],
        fontWeight: '500',
    },
});
