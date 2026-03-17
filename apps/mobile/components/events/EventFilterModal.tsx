import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { SPORT_CATEGORIES } from '../../constants/Categories';
import { useTheme } from '@react-navigation/native';

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


const DIVISIONS = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];

export default function EventFilterModal({ visible, onClose, currentFilters, onApply }: EventFilterModalProps) {
    const { colors, dark } = useTheme();
    const styles = getStyles((colors as any), dark);

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
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

                <View style={styles.modalContent}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
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
                                <View style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#ffffff', opacity: dark ? 1 : 0.8 }]} />
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
                                        textColor={colors.text}
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
                                        <View style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#ffffff', opacity: dark ? 1 : 0.8 }]} />
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
                                {SPORT_CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.chip,
                                            selectedCategory === cat.id && styles.chipActive
                                        ]}
                                        onPress={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                                    >
                                        <View style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#ffffff', opacity: dark ? 1 : 0.8 }]} />
                                        <Text style={[
                                            styles.chipText,
                                            selectedCategory === cat.id && styles.chipTextActive
                                        ]}>
                                            {cat.label}
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
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <LinearGradient
                                colors={dark ? ['#F97316', '#fdba74'] : Colors.gradients.warmTech as [string, string]}
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

const getStyles = (colors: any, dark: boolean) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: colors.border,
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
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    iconButton: {
        padding: 4,
    },
    resetButton: {
        padding: 4,
    },
    resetText: {
        color: colors.textSecondary,
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
        color: colors.text,
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
        borderColor: colors.inputBorder,
        overflow: 'hidden',
    },
    datePickerContainer: {
        marginTop: 10,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.inputBg,
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 10,
        fontSize: 15,
        color: colors.text,
    },
    placeholderText: {
        color: colors.textSecondary,
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
        borderColor: colors.inputBorder,
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
        color: colors.textSecondary,
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
        borderTopColor: colors.border,
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
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
