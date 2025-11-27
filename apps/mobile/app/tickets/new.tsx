import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { apis } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewTicketScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [formData, setFormData] = useState({
        durationMinutes: '60',
        sportType: 'basketball',
        intensity: 'Medium',
    });

    const handleCreate = async () => {
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
                    <Ionicons name="arrow-back" size={24} color="#333" />
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
                            <Text>{date.toLocaleDateString()}</Text>
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
                            <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
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
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
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
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    pillActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    pillText: {
        color: '#374151',
    },
    pillTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
