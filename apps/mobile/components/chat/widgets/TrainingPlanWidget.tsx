import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function TrainingPlanWidget({ data }: { data?: any }) {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary[50], '#fff']}
                style={styles.header}
            >
                <View style={styles.headerTitle}>
                    <MaterialCommunityIcons name="weight-lifter" size={24} color={Colors.primary[600]} />
                    <Text style={styles.title}>個人化運動訓練計畫</Text>
                </View>
                <Text style={styles.subtitle}>系統為您配置的建議課表</Text>
            </LinearGradient>
            
            <View style={styles.content}>
                <View style={styles.planItem}>
                    <Ionicons name="fitness-outline" size={20} color={Colors.gray[600]} />
                    <Text style={styles.planText}>即將解鎖根據您的目標量身打造的訓練！</Text>
                </View>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>查看詳細課表</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.gray[200],
        marginBottom: 8,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.gray[900],
    },
    subtitle: {
        fontSize: 13,
        color: Colors.gray[500],
        marginLeft: 32,
    },
    content: {
        padding: 16,
        gap: 16,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.gray[50],
        padding: 12,
        borderRadius: 12,
    },
    planText: {
        fontSize: 14,
        color: Colors.gray[700],
        flex: 1,
    },
    button: {
        backgroundColor: Colors.primary[500],
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
