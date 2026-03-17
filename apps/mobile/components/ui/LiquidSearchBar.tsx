import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SEARCH_BAR_HEIGHT = 52;

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
    style?: any;
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
}: LiquidSearchBarProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme !== 'light';

    const theme = {
        shadowColor: isDark ? '#000000' : '#888888',
        glassBg: glassColor || (isDark ? 'rgba(40, 40, 45, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        iconColor: isDark ? '#9CA3AF' : Colors.gray[500],
        iconBg: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
        textColor: isDark ? '#FFFFFF' : Colors.gray[900],
        placeholderColor: isDark ? '#6B7280' : Colors.gray[400],
        buttonBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    };

    return (
        <View style={[styles.container, style, { shadowColor: theme.shadowColor }]}>
            <View
                style={[
                    styles.canvasContainer,
                    { backgroundColor: theme.glassBg, borderColor: theme.borderColor }
                ]}
            />
            <View style={styles.inputContainer}>
                <View style={[styles.searchIconContainer, { backgroundColor: theme.iconBg }]}>
                    <Ionicons
                        name="search"
                        size={18}
                        color={theme.iconColor}
                    />
                </View>
                <TextInput
                    ref={inputRef}
                    style={[styles.input, { color: theme.textColor }]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.placeholderColor}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={onFocus}
                    onSubmitEditing={onSubmitEditing}
                    returnKeyType="search"
                />
                {value ? (
                    <TouchableOpacity
                        onPress={onClear}
                        style={[styles.clearButton, { backgroundColor: theme.buttonBg }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-circle" size={18} color={theme.iconColor} />
                    </TouchableOpacity>
                ) : null}
                {isFocused && (
                    <TouchableOpacity
                        onPress={onCancel}
                        style={[styles.cancelButton, { backgroundColor: theme.iconBg }]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.cancelText, { color: theme.textColor }]}>取消</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        padding: 0,
        letterSpacing: 0.2,
    },
    clearButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    cancelButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginLeft: 8,
        borderRadius: 12,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
