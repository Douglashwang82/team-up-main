import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SEARCH_BAR_HEIGHT = 52;
const SEARCH_BAR_WIDTH = SCREEN_WIDTH - 32;

interface LiquidSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onFocus?: () => void;
    onSubmitEditing?: () => void;
    onClear?: () => void;
    onCancel?: () => void;
    isFocused?: boolean;
    inputRef?: React.RefObject<TextInput | null>;
    glassColor?: string;
    placeholder?: string;
}

export default function LiquidSearchBar({
    value,
    onChangeText,
    onFocus,
    onSubmitEditing,
    onClear,
    onCancel,
    isFocused,
    inputRef,
    style,
    glassColor,
    placeholder = "搜尋活動...",
}: LiquidSearchBarProps & { style?: any }) {
    return (
        <View style={[styles.container, style]}>
            {/* Glass Background */}
            <GlassView
                style={[styles.canvasContainer, glassColor ? { backgroundColor: glassColor } : null]}
                glassEffectStyle="regular"
            />

            {/* Search Input Overlay */}
            <View style={styles.inputContainer}>
                <View style={styles.searchIconContainer}>
                    <Ionicons
                        name="search"
                        size={18}
                        color={Colors.gray[500]}
                    />
                </View>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.gray[400]}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={onFocus}
                    onSubmitEditing={onSubmitEditing}
                    returnKeyType="search"
                />
                {value ? (
                    <TouchableOpacity
                        onPress={onClear}
                        style={styles.clearButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-circle" size={18} color={Colors.gray[500]} />
                    </TouchableOpacity>
                ) : null}
                {isFocused && (
                    <TouchableOpacity
                        onPress={onCancel}
                        style={styles.cancelButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelText}>取消</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: SEARCH_BAR_HEIGHT,
        position: 'relative',
        // Premium glass shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    canvasContainer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 26,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    inputContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
    },
    searchIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.gray[900],
        fontWeight: '500',
        padding: 0,
        letterSpacing: 0.2,
    },
    clearButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    cancelButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginLeft: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 12,
    },
    cancelText: {
        fontSize: 14,
        color: "black",
        fontWeight: '600',
    },
});
