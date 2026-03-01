import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export interface EventFilterState {
    datetime_after?: string;
    division?: string;
    category?: string;
}

interface EventFilterModalProps {
    visible: boolean;
    onClose: () => void;
    currentFilters: EventFilterState;
    onApply: (filters: EventFilterState) => void;
}

const CATEGORIES = ['籃球', '羽球', '排球', '網球', '桌球', '撞球', '游泳', '健身'];
const DIVISIONS = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];

export default function EventFilterModal({ visible, onClose, currentFilters, onApply }: EventFilterModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(currentFilters.category);
    const [selectedDivision, setSelectedDivision] = useState<string | undefined>(currentFilters.division);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        currentFilters.datetime_after ? new Date(currentFilters.datetime_after) : undefined
    );
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleApply = () => {
        onApply({
            category: selectedCategory,
            division: selectedDivision,
            datetime_after: selectedDate ? selectedDate.toISOString() : undefined,
        });
        onClose();
    };

    const handleReset = () => {
        setSelectedCategory(undefined);
        setSelectedDivision(undefined);
        setSelectedDate(undefined);
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="light" />

                <View style={styles.modalContent}>
                    <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="clear" />

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                            <Ionicons name="close" size={24} color={Colors.gray[600]} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>篩選器</Text>
                        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                            <Text style={styles.resetText}>重設</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Datetime Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>日期與時間 (Date & Time)</Text>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="clear" />
                                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                                <Text style={[styles.dateText, !selectedDate && styles.placeholderText]}>
                                    {selectedDate ? selectedDate.toLocaleDateString() + ' ' + selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '選擇日期與時間...'}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <View style={styles.datePickerContainer}>
                                    <DateTimePicker
                                        value={selectedDate || new Date()}
                                        mode="datetime"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={handleDateChange}
                                        style={styles.iosDatePicker}
                                        textColor={Colors.gray[900]}
                                    />
                                </View>
                            )}
                        </View>

                        {/* Division Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>地區 (Division)</Text>
                            <View style={styles.chipContainer}>
                                {DIVISIONS.map((div) => (
                                    <TouchableOpacity
                                        key={div}
                                        style={[
                                            styles.chip,
                                            selectedDivision === div && styles.chipActive
                                        ]}
                                        onPress={() => setSelectedDivision(selectedDivision === div ? undefined : div)}
                                    >
                                        <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="clear" />
                                        <Text style={[
                                            styles.chipText,
                                            selectedDivision === div && styles.chipTextActive
                                        ]}>
                                            {div}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Category Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>運動種類 (Category)</Text>
                            <View style={styles.chipContainer}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.chip,
                                            selectedCategory === cat && styles.chipActive
                                        ]}
                                        onPress={() => setSelectedCategory(selectedCategory === cat ? undefined : cat)}
                                    >
                                        <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="clear" />
                                        <Text style={[
                                            styles.chipText,
                                            selectedCategory === cat && styles.chipTextActive
                                        ]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Bottom padding for scrollview */}
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    {/* Footer / Apply Button */}
                    <View style={styles.footer}>
                        <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="clear" />
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <LinearGradient
                                colors={Colors.gradients.warmTech as [string, string]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.applyGradient}
                            >
                                <Text style={styles.applyText}>套用篩選</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        overflow: 'hidden',
        // Premium glass shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.gray[900],
    },
    iconButton: {
        padding: 4,
    },
    resetButton: {
        padding: 4,
    },
    resetText: {
        color: Colors.gray[500],
        fontSize: 15,
        fontWeight: '500',
    },
    scrollView: {
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.gray[800],
        marginBottom: 12,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
    },
    datePickerContainer: {
        marginTop: 10,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 10,
        fontSize: 15,
        color: Colors.gray[900],
    },
    placeholderText: {
        color: Colors.gray[400],
    },
    iosDatePicker: {
        marginTop: 10,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '10', // Light tint for active state glass
    },
    chipText: {
        fontSize: 14,
        color: Colors.gray[600],
        fontWeight: '500',
    },
    chipTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    applyButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    applyGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
