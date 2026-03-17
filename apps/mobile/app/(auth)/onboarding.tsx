import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/apiClient";
import Button from "../../components/ui/Button";
import { SPORT_CATEGORIES } from "../../constants/Categories";

const SKILL_LEVELS = [
    { id: "beginner", label: "初學者 (Beginner)" },
    { id: "intermediate", label: "中階 (Intermediate)" },
    { id: "advanced", label: "進階 (Advanced)" }
];

const TIME_SLOTS = [
    { id: "weekday_morning", label: "平日早上" },
    { id: "weekday_afternoon", label: "平日下午" },
    { id: "weekday_evening", label: "平日晚上" },
    { id: "weekend_morning", label: "假日早上" },
    { id: "weekend_afternoon", label: "假日下午" },
    { id: "weekend_evening", label: "假日晚上" }
];

const LANGUAGES = [
    { id: "zh-TW", label: "繁體中文" },
    { id: "en", label: "English" }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data State
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [skillLevels, setSkillLevels] = useState<Record<string, string>>({});
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
    const [preferredLanguage, setPreferredLanguage] = useState<string>("zh-TW");
    const [customPreferences, setCustomPreferences] = useState<string>("");

    const toggleSport = (sportId: string) => {
        setSelectedSports(prev => {
            if (prev.includes(sportId)) {
                const newLevels = { ...skillLevels };
                delete newLevels[sportId];
                setSkillLevels(newLevels);
                return prev.filter(id => id !== sportId);
            }
            return [...prev, sportId];
        });
    };

    const setSportSkill = (sportId: string, levelId: string) => {
        setSkillLevels(prev => ({ ...prev, [sportId]: levelId }));
    };

    const toggleTimeSlot = (slotId: string) => {
        setSelectedTimeSlots(prev =>
            prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
        );
    };

    const handleNext = () => {
        if (step === 1 && selectedSports.length > 0) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            await api.user.updateUserInfo({
                preferred_sports: selectedSports,
                skill_levels: skillLevels,
                preferred_time_slots: selectedTimeSlots,
                preferred_language: preferredLanguage,
                custom_preferences: customPreferences
            });
            await refreshUser();
            router.replace("/");
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>您平常打哪些球？</Text>
            <Text style={styles.subtitle}>選擇您感興趣的運動，並設定您的實力程度，讓我們為您推薦最適合的局。</Text>

            <View style={styles.sportsGrid}>
                {SPORT_CATEGORIES.map(sport => {
                    const isSelected = selectedSports.includes(sport.id);
                    return (
                        <View key={sport.id} style={styles.sportBlock}>
                            <TouchableOpacity
                                style={[styles.sportPill, isSelected && styles.sportPillSelected]}
                                onPress={() => toggleSport(sport.id)}
                            >
                                <Text style={[styles.sportPillText, isSelected && styles.sportPillTextSelected]}>
                                    {sport.label}
                                </Text>
                            </TouchableOpacity>

                            {isSelected && (
                                <View style={styles.skillSelector}>
                                    {SKILL_LEVELS.map(level => (
                                        <TouchableOpacity
                                            key={level.id}
                                            style={[
                                                styles.skillPill,
                                                skillLevels[sport.id] === level.id && styles.skillPillSelected
                                            ]}
                                            onPress={() => setSportSkill(sport.id, level.id)}
                                        >
                                            <Text style={[
                                                styles.skillPillText,
                                                skillLevels[sport.id] === level.id && styles.skillPillTextSelected
                                            ]}>
                                                {level.label.split(' ')[0]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>

            <Button
                title="下一步"
                onPress={handleNext}
                disabled={selectedSports.length === 0}
                style={styles.nextButton}
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>平常什麼時候有空？</Text>
            <Text style={styles.subtitle}>告訴我們您常出沒的時間，AI 將更精準的幫您媒合。</Text>

            <View style={styles.timeSlotsGrid}>
                {TIME_SLOTS.map(slot => {
                    const isSelected = selectedTimeSlots.includes(slot.id);
                    return (
                        <TouchableOpacity
                            key={slot.id}
                            style={[styles.timeSlotPill, isSelected && styles.timeSlotPillSelected]}
                            onPress={() => toggleTimeSlot(slot.id)}
                        >
                            <Text style={[styles.timeSlotPillText, isSelected && styles.timeSlotPillTextSelected]}>
                                {slot.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.actionRow}>
                <Button
                    title="上一步"
                    variant="outline"
                    onPress={() => setStep(1)}
                    style={styles.backButton}
                />
                <Button
                    title="下一步"
                    onPress={handleNext}
                    style={styles.finishButton}
                />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>個人化設定</Text>
            <Text style={styles.subtitle}>選擇慣用語言，或寫下更多特別的偏好（例如：喜歡打全場、需要冷氣等），這些都會幫助 AI 更懂你。</Text>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>慣用語言</Text>
            </View>
            <View style={styles.languageGrid}>
                {LANGUAGES.map(lang => {
                    const isSelected = preferredLanguage === lang.id;
                    return (
                        <TouchableOpacity
                            key={lang.id}
                            style={[styles.languagePill, isSelected && styles.languagePillSelected]}
                            onPress={() => setPreferredLanguage(lang.id)}
                        >
                            <Text style={[styles.languagePillText, isSelected && styles.languagePillTextSelected]}>
                                {lang.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <Text style={styles.sectionTitle}>其他自定義偏好</Text>
            </View>
            <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="例如：喜歡早上六點打球、希望對手實力相近、場地要有冷氣..."
                placeholderTextColor={Colors.gray[400]}
                value={customPreferences}
                onChangeText={setCustomPreferences}
                textAlignVertical="top"
            />

            <View style={styles.actionRow}>
                <Button
                    title="上一步"
                    variant="outline"
                    onPress={() => setStep(2)}
                    style={styles.backButton}
                />
                <Button
                    title="完成設定"
                    onPress={handleFinish}
                    loading={loading}
                    style={styles.finishButton}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.base,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 40,
    },
    stepContainer: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: Colors.gray[900],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray[600],
        marginBottom: 32,
        lineHeight: 24,
    },
    sportsGrid: {
        flexDirection: "column",
        gap: 16,
        marginBottom: 40,
    },
    sportBlock: {
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    sportPill: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: Colors.gray[100],
        alignSelf: 'flex-start',
    },
    sportPillSelected: {
        backgroundColor: Colors.primary,
    },
    sportPillText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.gray[700],
    },
    sportPillTextSelected: {
        color: Colors.white,
    },
    skillSelector: {
        flexDirection: "row",
        gap: 8,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100],
    },
    skillPill: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: Colors.gray[50],
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    skillPillSelected: {
        backgroundColor: Colors.primary + "15",
        borderColor: Colors.primary,
    },
    skillPillText: {
        fontSize: 14,
        color: Colors.gray[600],
        fontWeight: "500",
    },
    skillPillTextSelected: {
        color: Colors.primary,
        fontWeight: "600",
    },
    timeSlotsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 40,
    },
    timeSlotPill: {
        width: "48%",
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    timeSlotPillSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    timeSlotPillText: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.gray[700],
    },
    timeSlotPillTextSelected: {
        color: Colors.white,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.gray[800],
    },
    languageGrid: {
        flexDirection: "row",
        gap: 12,
    },
    languagePill: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    languagePillSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    languagePillText: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.gray[700],
    },
    languagePillTextSelected: {
        color: Colors.white,
    },
    textArea: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.gray[900],
        minHeight: 120,
    },
    nextButton: {
        marginTop: "auto",
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: "auto",
    },
    backButton: {
        flex: 1,
    },
    finishButton: {
        flex: 2,
    }
});
