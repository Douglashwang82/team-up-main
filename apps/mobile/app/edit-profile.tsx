import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { setTokens, api } from "../lib/apiClient";
import { apis } from "../lib/api";
import { SPORT_CATEGORIES } from "../constants/Categories";

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

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, refreshUser, logout } = useAuth();

    // Display name editing
    const [displayName, setDisplayName] = useState(user?.display_name || "");
    const [isSavingName, setIsSavingName] = useState(false);

    // Password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Profile Preferences
    const [selectedSports, setSelectedSports] = useState<string[]>(user?.preferred_sports || []);
    const [skillLevels, setSkillLevels] = useState<Record<string, string>>(user?.skill_levels || {});
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(user?.preferred_time_slots || []);
    const [preferredLanguage, setPreferredLanguage] = useState<string>(user?.preferred_language || "zh-TW");
    const [customPreferences, setCustomPreferences] = useState<string>(user?.custom_preferences || "");
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);

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

    const handleSavePreferences = async () => {
        setIsSavingPreferences(true);
        try {
            await api.user.updateUserInfo({
                preferred_sports: selectedSports,
                skill_levels: skillLevels,
                preferred_time_slots: selectedTimeSlots,
                preferred_language: preferredLanguage,
                custom_preferences: customPreferences
            });
            await refreshUser();
            Alert.alert("成功", "運動偏好已更新");
        } catch (error) {
            console.error("Failed to update preferences:", error);
            Alert.alert("錯誤", "更新失敗，請稍後再試");
        } finally {
            setIsSavingPreferences(false);
        }
    };

    const handleSaveName = async () => {
        const trimmed = displayName.trim();
        if (!trimmed) {
            Alert.alert("錯誤", "顯示名稱不能為空");
            return;
        }
        if (trimmed === user?.display_name) {
            Alert.alert("提示", "名稱未變更");
            return;
        }

        setIsSavingName(true);
        try {
            // @ts-ignore
            const user = await apis.auth.updateCurrentUser({ display_name: trimmed });
            await refreshUser();
            Alert.alert("成功", "顯示名稱已更新");
        } catch (error) {
            console.error("Failed to update display name:", error);
            Alert.alert("錯誤", "更新失敗，請稍後再試");
        } finally {
            setIsSavingName(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("錯誤", "請填寫所有密碼欄位");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("錯誤", "新密碼與確認密碼不一致");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("錯誤", "新密碼至少需要 6 個字元");
            return;
        }

        setIsSavingPassword(true);
        try {
            await apis.auth.updatePassword({
                updatePasswordRequest: {
                    oldPassword: currentPassword,
                    newPassword,
                },
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            Alert.alert("成功", "密碼已更新");
        } catch (error) {
            console.error("Failed to update password:", error);
            Alert.alert("錯誤", "密碼更新失敗，請確認目前密碼是否正確");
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "登出",
            "確定要登出您的帳號嗎？",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "登出",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                            // Navigation to sign-in handles itself via Auth context
                        } catch (error) {
                            console.error("Logout failed:", error);
                            Alert.alert("錯誤", "登出失敗，請稍後再試");
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "刪除帳號",
            "確定要刪除帳號嗎？此操作無法復原，所有資料將被永久刪除。",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "確定刪除",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeletingAccount(true);
                        try {
                            await apis.auth.deleteAccount();
                            Alert.alert("已刪除", "您的帳號已被刪除");
                            // Logout will be triggered by the auth state change
                        } catch (error) {
                            console.error("Failed to delete account:", error);
                            Alert.alert("錯誤", "刪除帳號失敗，請稍後再試");
                        } finally {
                            setIsDeletingAccount(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="close" size={28} color={Colors.gray[900]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>編輯個人資料</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Display Name Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>顯示名稱</Text>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="輸入您的名稱"
                            placeholderTextColor={Colors.gray[400]}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.saveButton, isSavingName && styles.saveButtonDisabled]}
                            onPress={handleSaveName}
                            disabled={isSavingName}
                            activeOpacity={0.7}
                        >
                            {isSavingName ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Text style={styles.saveButtonText}>儲存名稱</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Sports Preferences Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>運動偏好</Text>

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

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>常出沒時間</Text>
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

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>慣用語言</Text>
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

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>其他自定義偏好</Text>
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

                        <TouchableOpacity
                            style={[styles.saveButton, isSavingPreferences && styles.saveButtonDisabled, { marginTop: 16 }]}
                            onPress={handleSavePreferences}
                            disabled={isSavingPreferences}
                            activeOpacity={0.7}
                        >
                            {isSavingPreferences ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Text style={styles.saveButtonText}>儲存運動偏好</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Email (read-only) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>電子信箱</Text>
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>{user?.email || ""}</Text>
                            <Ionicons name="lock-closed-outline" size={16} color={Colors.gray[400]} />
                        </View>
                    </View>

                    {/* Password Change Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>變更密碼</Text>
                        <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="目前密碼"
                            placeholderTextColor={Colors.gray[400]}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="新密碼（至少 6 個字元）"
                            placeholderTextColor={Colors.gray[400]}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="確認新密碼"
                            placeholderTextColor={Colors.gray[400]}
                            secureTextEntry
                        />
                        <TouchableOpacity
                            style={[styles.saveButton, isSavingPassword && styles.saveButtonDisabled]}
                            onPress={handleChangePassword}
                            disabled={isSavingPassword}
                            activeOpacity={0.7}
                        >
                            {isSavingPassword ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Text style={styles.saveButtonText}>更新密碼</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Danger Zone */}
                    <View style={[styles.section, styles.dangerSection]}>
                        <Text style={[styles.sectionTitle, styles.dangerTitle]}>帳號管理</Text>

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.logoutButtonText}>登出帳號</Text>
                        </TouchableOpacity>

                        <Text style={styles.dangerDescription}>
                            如果您希望永久離開 Team-Up，可以選擇刪除帳號。所有資料將被永久刪除，無法復原。
                        </Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeleteAccount}
                            disabled={isDeletingAccount}
                            activeOpacity={0.7}
                        >
                            {isDeletingAccount ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Text style={styles.deleteButtonText}>刪除帳號</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.base,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        fontWeight: "bold",
        color: Colors.gray[900],
    },
    headerSpacer: {
        width: 36,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.gray[800],
        marginBottom: 12,
    },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray[300],
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: Colors.gray[900],
        marginBottom: 12,
    },
    readOnlyField: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.gray[100],
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: 12,
        padding: 14,
    },
    readOnlyText: {
        fontSize: 16,
        color: Colors.gray[600],
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
    sportsGrid: {
        flexDirection: "column",
        gap: 16,
        marginBottom: 8,
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
        marginBottom: 8,
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
    languageGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 8,
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
        marginBottom: 8,
    },
    dangerSection: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.error[100],
        paddingTop: 24,
    },
    dangerTitle: {
        color: Colors.error[500],
    },
    dangerDescription: {
        fontSize: 14,
        color: Colors.gray[500],
        marginBottom: 16,
        lineHeight: 20,
    },
    logoutButton: {
        backgroundColor: Colors.gray[100],
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 24,
    },
    logoutButtonText: {
        color: Colors.gray[900],
        fontSize: 16,
        fontWeight: "600",
    },
    deleteButton: {
        backgroundColor: Colors.error[500],
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
});
