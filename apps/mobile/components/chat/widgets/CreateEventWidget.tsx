import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function CreateEventWidget() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name="add" size={24} color="white" />
                </View>
                <View style={styles.textStack}>
                    <Text style={[styles.title, { color: colors.text }]}>發起新活動</Text>
                    <Text style={[styles.subtitle, { color: (colors as any).textSecondary }]}>準備好場地與時間了嗎？</Text>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/event-create-modal')}
            >
                <Text style={styles.buttonText}>開始填寫</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStack: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    button: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    }
});
