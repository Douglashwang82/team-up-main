import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface MatchedUser {
    user: {
        id: string;
        display_name: string;
        avatar_url: string | null;
        preferred_sports: string[];
        skill_levels: Record<string, string>;
    };
    match_score: number;
    shared_sports: string[];
    skill_compatibility: Record<string, string>;
}

const SPORT_EMOJI: Record<string, string> = {
    basketball: '🏀',
    badminton: '🏸',
    tennis: '🎾',
    table_tennis: '🏓',
    volleyball: '🏐',
    squash: '🎯',
};

const SKILL_LABEL: Record<string, string> = {
    beginner: '初學',
    intermediate: '中級',
    advanced: '進階',
};

const COMPAT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    exact: { bg: '#DCFCE7', text: '#16A34A', label: '完美' },
    close: { bg: '#FEF3C7', text: '#CA8A04', label: '接近' },
    different: { bg: '#FEE2E2', text: '#DC2626', label: '差異' },
    unknown: { bg: '#F3F4F6', text: '#9CA3AF', label: '？' },
};

const RANK_COLORS: readonly [string, string][] = [
    ['#FFD700', '#FFA500'],  // Gold
    ['#C0C0C0', '#A0A0A0'],  // Silver
    ['#CD7F32', '#B87333'],  // Bronze
];

export default function MatchedUsersWidget({ data }: { data?: MatchedUser[] }) {
    const router = useRouter();

    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="people" size={18} color={Colors.primary} />
                    <Text style={styles.title}>推薦球友</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={28} color={Colors.gray[300]} />
                    <Text style={styles.emptyText}>暫無匹配的球友</Text>
                    <Text style={styles.emptySubtext}>請先設定您的運動偏好</Text>
                </View>
            </View>
        );
    }

    const handlePress = (match: MatchedUser) => {
        const matchData = {
            ...match.user,
            match_score: match.match_score,
            shared_sports: match.shared_sports,
            skill_compatibility: match.skill_compatibility,
        };
        router.push({
            pathname: '/user/[id]',
            params: { id: match.user.id, matchData: JSON.stringify(matchData) },
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="people" size={18} color={Colors.primary} />
                <Text style={styles.title}>推薦球友 Top {data.length}</Text>
            </View>
            <View style={styles.cardList}>
                {data.map((match, index) => (
                    <TouchableOpacity
                        key={match.user.id}
                        style={styles.cardContainer}
                        onPress={() => handlePress(match)}
                        activeOpacity={0.82}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.94)', 'rgba(249,250,251,0.98)']}
                            style={styles.card}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.hostInfo}>
                                    <View style={styles.avatar}>
                                        <LinearGradient
                                            colors={[Colors.primary, '#FF9A5C']}
                                            style={styles.avatarGradient}
                                        >
                                            <Ionicons name="person" size={20} color="white" />
                                        </LinearGradient>
                                    </View>
                                    <View style={styles.headerTextWrap}>
                                        <Text style={styles.hostLabel}>推薦球友</Text>
                                        <Text style={styles.userName} numberOfLines={1}>
                                            {match.user.display_name}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.headerBadges}>
                                    <LinearGradient
                                        colors={RANK_COLORS[index] || RANK_COLORS[2]}
                                        style={styles.rankBadge}
                                    >
                                        <Text style={styles.rankText}>#{index + 1}</Text>
                                    </LinearGradient>
                                    <View style={styles.scoreBadge}>
                                        <Ionicons name="flash" size={12} color={Colors.primary} />
                                        <Text style={styles.scoreText}>{match.match_score}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.sectionTitle}>共同項目與程度</Text>
                                <View style={styles.sportsRow}>
                                    {match.shared_sports.map(sport => {
                                        const compat = match.skill_compatibility[sport];
                                        const compatInfo = COMPAT_COLORS[compat] || COMPAT_COLORS.unknown;
                                        const theirLevel = match.user.skill_levels?.[sport];
                                        return (
                                            <View key={sport} style={styles.sportChip}>
                                                <Text style={styles.sportEmoji}>{SPORT_EMOJI[sport] || '⚽'}</Text>
                                                <Text style={styles.sportLevel}>{SKILL_LABEL[theirLevel] || '?'}</Text>
                                                <View style={[styles.compatPill, { backgroundColor: compatInfo.bg }]}> 
                                                    <Text style={[styles.compatText, { color: compatInfo.text }]}> 
                                                        {compatInfo.label}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <View style={styles.footerPill}>
                                    <Ionicons name="people" size={13} color={Colors.gray[600]} />
                                    <Text style={styles.footerText}>點擊查看完整檔案</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        backgroundColor: 'white',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.gray[100],
        gap: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.gray[900],
        letterSpacing: -0.3,
    },
    emptyContainer: {
        paddingVertical: 28,
        alignItems: 'center',
        gap: 6,
    },
    emptyText: {
        color: Colors.gray[500],
        fontSize: 15,
        fontWeight: '600',
        marginTop: 4,
    },
    emptySubtext: {
        color: Colors.gray[400],
        fontSize: 13,
    },
    cardList: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    cardContainer: {
        marginBottom: 12,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    card: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    hostInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    hostLabel: {
        fontSize: 11,
        color: Colors.gray[500],
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    headerTextWrap: {
        flex: 1,
    },
    headerBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    rankText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
    },
    avatar: {
        marginRight: 2,
    },
    avatarGradient: {
        width: 42,
        height: 42,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBody: {
        marginBottom: 14,
    },
    userName: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.gray[900],
        letterSpacing: -0.3,
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '12',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 3,
        borderWidth: 1,
        borderColor: Colors.primary + '24',
    },
    scoreText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gray[600],
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    sportsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    sportChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray[50],
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    sportEmoji: {
        fontSize: 13,
    },
    sportLevel: {
        fontSize: 11,
        color: Colors.gray[600],
        fontWeight: '600',
    },
    compatPill: {
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    compatText: {
        fontSize: 10,
        fontWeight: '700',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
        paddingTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.gray[100],
        borderRadius: 9,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    footerText: {
        fontSize: 12,
        color: Colors.gray[600],
        fontWeight: '600',
    },
});
