import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Modal,
    Alert,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from '../../lib/apiClient';
import { LinearGradient } from 'expo-linear-gradient';
import { eventsApi } from '../../lib/apiClient';

const SPORT_EMOJI: Record<string, string> = {
    basketball: '🏀',
    badminton: '🏸',
    tennis: '🎾',
    table_tennis: '🏓',
    volleyball: '🏐',
    squash: '🎯',
};

const SPORT_LABEL: Record<string, string> = {
    basketball: '籃球',
    badminton: '羽球',
    tennis: '網球',
    table_tennis: '桌球',
    volleyball: '排球',
    squash: '壁球',
};

const SKILL_LABEL: Record<string, { label: string; color: string }> = {
    beginner: { label: '初學者', color: '#22C55E' },
    intermediate: { label: '中級', color: '#F59E0B' },
    advanced: { label: '進階', color: '#EF4444' },
};

interface UserProfile {
    id: string;
    display_name: string;
    avatar_url: string | null;
    preferred_sports: string[];
    skill_levels: Record<string, string>;
    match_score?: number;
    shared_sports?: string[];
    skill_compatibility?: Record<string, string>;
}

interface OwnedEvent {
    id: string;
    title: string;
    max_participants: number;
    participant_count: number;
}

export default function UserDetailScreen() {
    const { id, matchData } = useLocalSearchParams<{ id: string; matchData?: string }>();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEventPicker, setShowEventPicker] = useState(false);
    const [ownedEvents, setOwnedEvents] = useState<OwnedEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [inviting, setInviting] = useState<string | null>(null);

    const fetchOwnedEvents = async () => {
        setLoadingEvents(true);
        try {
            const events = await eventsApi.getOwnedEvents();
            setOwnedEvents(events);
        } catch (e) {
            console.error('Failed to load owned events', e);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleOpenInvite = () => {
        fetchOwnedEvents();
        setShowEventPicker(true);
    };

    const handleInvite = async (eventId: string) => {
        if (!user) return;
        setInviting(eventId);
        try {
            const res = await eventsApi.inviteUser(eventId, user.id);
            setShowEventPicker(false);
            Alert.alert('成功 🎉', res.message || `已邀請 ${user.display_name} 加入活動`);
        } catch (e: any) {
            const msg = e?.message || '';
            if (msg.includes('already_joined')) {
                Alert.alert('提示', '此球友已在該活動中');
            } else if (msg.includes('event_full')) {
                Alert.alert('提示', '活動人數已滿');
            } else {
                Alert.alert('錯誤', '邀請失敗，請稍後再試');
            }
        } finally {
            setInviting(null);
        }
    };

    useEffect(() => {
        // Parse match data passed from the widget
        if (matchData) {
            try {
                const parsed = JSON.parse(matchData);
                setUser(parsed);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [matchData]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>球友資料</Text>
                    <View style={{ width: 36 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={{ color: Colors.gray[500] }}>找不到此用戶</Text>
                </View>
            </SafeAreaView>
        );
    }

    const sports = user.preferred_sports || [];
    const skills = user.skill_levels || {};

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>球友資料</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Hero */}
                <LinearGradient
                    colors={['#FF9A5C', Colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroGradient}
                >
                    <View style={styles.avatarLarge}>
                        <Ionicons name="person" size={44} color="white" />
                    </View>
                    <Text style={styles.heroName}>{user.display_name}</Text>
                    {user.match_score !== undefined && (
                        <View style={styles.matchBadge}>
                            <Ionicons name="star" size={14} color="#FCD34D" />
                            <Text style={styles.matchBadgeText}>匹配度 {user.match_score}</Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Invite Button */}
                <View style={styles.inviteSection}>
                    <TouchableOpacity style={styles.inviteButton} onPress={handleOpenInvite} activeOpacity={0.8}>
                        <LinearGradient
                            colors={[Colors.primary, '#FF9A5C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.inviteButtonGradient}
                        >
                            <Ionicons name="person-add" size={20} color="white" />
                            <Text style={styles.inviteButtonText}>邀請加入活動</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Sports & Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>運動項目與實力</Text>
                    {sports.length === 0 ? (
                        <Text style={styles.emptyText}>尚未設定運動偏好</Text>
                    ) : (
                        sports.map(sport => {
                            const skill = skills[sport];
                            const skillInfo = SKILL_LABEL[skill] || { label: skill || '未設定', color: Colors.gray[400] };
                            const compat = user.skill_compatibility?.[sport];

                            return (
                                <View key={sport} style={styles.sportRow}>
                                    <View style={styles.sportLeft}>
                                        <Text style={styles.sportRowEmoji}>{SPORT_EMOJI[sport] || '⚽'}</Text>
                                        <Text style={styles.sportRowName}>{SPORT_LABEL[sport] || sport}</Text>
                                    </View>
                                    <View style={styles.sportRight}>
                                        <View style={[styles.skillBadge, { borderColor: skillInfo.color + '40', backgroundColor: skillInfo.color + '10' }]}>
                                            <View style={[styles.skillDot, { backgroundColor: skillInfo.color }]} />
                                            <Text style={[styles.skillBadgeText, { color: skillInfo.color }]}>{skillInfo.label}</Text>
                                        </View>
                                        {compat && (
                                            <View style={[styles.compatBadge, {
                                                backgroundColor: compat === 'exact' ? '#DCFCE7' : compat === 'close' ? '#FEF3C7' : '#FEE2E2',
                                            }]}>
                                                <Text style={[styles.compatText, {
                                                    color: compat === 'exact' ? '#16A34A' : compat === 'close' ? '#CA8A04' : '#DC2626',
                                                }]}>
                                                    {compat === 'exact' ? '完美匹配' : compat === 'close' ? '程度接近' : '差距較大'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Shared Sports (if match data exists) */}
                {user.shared_sports && user.shared_sports.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>共同運動</Text>
                        <View style={styles.sharedSportsRow}>
                            {user.shared_sports.map(sport => (
                                <View key={sport} style={styles.sharedSportChip}>
                                    <Text style={styles.sharedSportEmoji}>{SPORT_EMOJI[sport] || '⚽'}</Text>
                                    <Text style={styles.sharedSportText}>{SPORT_LABEL[sport] || sport}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Event Picker Modal */}
            <Modal visible={showEventPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>選擇活動</Text>
                            <TouchableOpacity onPress={() => setShowEventPicker(false)}>
                                <Ionicons name="close" size={24} color={Colors.gray[600]} />
                            </TouchableOpacity>
                        </View>
                        {loadingEvents ? (
                            <View style={styles.modalLoading}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                            </View>
                        ) : ownedEvents.length === 0 ? (
                            <View style={styles.modalEmpty}>
                                <Ionicons name="calendar-outline" size={40} color={Colors.gray[300]} />
                                <Text style={styles.modalEmptyText}>您目前沒有進行中的活動</Text>
                                <Text style={styles.modalEmptySubtext}>先建立一個活動再邀請球友吧！</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={ownedEvents}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.eventPickerItem}
                                        onPress={() => handleInvite(item.id)}
                                        disabled={inviting === item.id}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.eventPickerInfo}>
                                            <Text style={styles.eventPickerTitle} numberOfLines={1}>{item.title}</Text>
                                            <Text style={styles.eventPickerMeta}>
                                                {item.participant_count}/{item.max_participants} 人
                                            </Text>
                                        </View>
                                        {inviting === item.id ? (
                                            <ActivityIndicator size="small" color={Colors.primary} />
                                        ) : (
                                            <View style={styles.eventPickerAction}>
                                                <Text style={styles.eventPickerActionText}>邀請</Text>
                                                <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.base,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
        backgroundColor: Colors.base,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.gray[900],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroGradient: {
        alignItems: 'center',
        paddingVertical: 36,
        paddingHorizontal: 20,
    },
    avatarLarge: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    heroName: {
        fontSize: 26,
        fontWeight: '700',
        color: 'white',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.15)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    matchBadgeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        padding: 20,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.gray[800],
        marginBottom: 16,
    },
    emptyText: {
        color: Colors.gray[400],
        fontSize: 14,
    },
    sportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.gray[100],
    },
    sportLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sportRowEmoji: {
        fontSize: 22,
    },
    sportRowName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.gray[800],
    },
    sportRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    skillBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        gap: 5,
    },
    skillDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    skillBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    compatBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    compatText: {
        fontSize: 11,
        fontWeight: '600',
    },
    sharedSportsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sharedSportChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '10',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.primary + '25',
    },
    sharedSportEmoji: {
        fontSize: 18,
    },
    sharedSportText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    // Invite button
    inviteSection: {
        paddingHorizontal: 20,
        marginTop: -12,
        marginBottom: 4,
    },
    inviteButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    inviteButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    inviteButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: 'white',
        letterSpacing: -0.3,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.gray[200],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.gray[900],
    },
    modalLoading: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    modalEmpty: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 8,
    },
    modalEmptyText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.gray[500],
        marginTop: 4,
    },
    modalEmptySubtext: {
        fontSize: 13,
        color: Colors.gray[400],
    },
    eventPickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.gray[100],
    },
    eventPickerInfo: {
        flex: 1,
        marginRight: 12,
    },
    eventPickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.gray[900],
        marginBottom: 2,
    },
    eventPickerMeta: {
        fontSize: 13,
        color: Colors.gray[500],
    },
    eventPickerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '12',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 4,
    },
    eventPickerActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
});
