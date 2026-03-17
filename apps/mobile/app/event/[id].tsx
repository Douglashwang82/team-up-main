import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Colors } from "../../constants/Colors";
import { setTokens, clearTokens, api } from "../../lib/apiClient";
import { useAuth } from "../../contexts/AuthContext";
import type { EventDetails } from "../../lib/types";

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<'none' | 'pending' | 'joined'>('none');

  // Split Bill State
  const [splitBillModalVisible, setSplitBillModalVisible] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  useEffect(() => {
    if (event) {
      const status = (event.user_join_status as 'none' | 'pending' | 'joined' | undefined) ||
        (event.participants?.some(p => p.user_id === user?.id) ? 'joined' : 'none');
      setJoinStatus(status);
    }
  }, [event, user]);

  const loadEvent = async () => {
    try {
      setError(null);
      const data = await api.events.get(id as string);
      setEvent(data);
    } catch (err) {
      console.error("Failed to load event:", err);
      setError("Failed to load event details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitBill = async () => {
    if (!event || !totalAmount) return;
    const amount = parseInt(totalAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("錯誤", "請輸入有效的總金額");
      return;
    }

    setIsSplitting(true);
    try {
      await api.events.splitBill(event.id, { total_amount: amount });
      Alert.alert("成功", "已完成結算分帳！");
      setSplitBillModalVisible(false);
      setTotalAmount("");
      loadEvent(); // Refresh to catch amounts and payment_status
    } catch (err) {
      Alert.alert("錯誤", err instanceof Error ? err.message : "分帳失敗");
    } finally {
      setIsSplitting(false);
    }
  };

  const togglePaymentStatus = async (participantId: string, currentStatus: string) => {
    if (!event) return;
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    try {
      await api.events.updateParticipantPayment(event.id, participantId, newStatus);
      // Optimistically update local state instead of full reload for snappiness, or just reload
      loadEvent();
    } catch (err) {
      console.error(err);
      Alert.alert("錯誤", "無法更新付款狀態");
    }
  };

  const handleJoin = async () => {
    if (!event) return;

    setIsJoining(true);
    try {
      const response = await api.events.join(event.id, {
        message: "我想加入這個活動！",
      });

      if (response.status === 'approved') {
        Alert.alert("成功", "您已加入此活動！", [{ text: "確定", onPress: () => loadEvent() }]);
        setJoinStatus('joined');
      } else if (response.status === 'submitted') {
        Alert.alert("已送出", "您的加入請求已送出，等待主辦人審核。", [{ text: "確定", onPress: () => loadEvent() }]);
        setJoinStatus('pending');
      }
    } catch (err) {
      console.error("Failed to join event:", err);
      const errorMessage = err instanceof Error ? err.message.toLowerCase() : "";

      if (errorMessage.includes("pending") || errorMessage.includes("already requested") || errorMessage.includes("already_applied")) {
        setJoinStatus('pending');
        Alert.alert("提示", "您已經送出過請求，請等待審核。");
      } else if (errorMessage.includes("already joined") || errorMessage.includes("participant")) {
        setJoinStatus('joined');
        Alert.alert("提示", "您已經是參加者了。");
      } else {
        Alert.alert("錯誤", err instanceof Error ? err.message : "加入活動失敗，請重試。");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return { bg: "rgba(76, 175, 80, 0.15)", text: "#388E3C" }; // Match EventCard
      case "closed":
        return { bg: "rgba(255, 152, 0, 0.15)", text: "#F57C00" };
      default:
        return { bg: "rgba(0, 0, 0, 0.05)", text: Colors.gray[600] };
    }
  };

  const isOwner = user && event && event.owner_user_id === user.id;
  const canJoin = event && event.status === "open" && joinStatus === "none" && !isOwner;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>正在載入活動...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <View style={styles.iconButtonGlass}>
                <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={80} color={Colors.error[500]} />
            <Text style={styles.errorTitle}>糟糕！</Text>
            <Text style={styles.errorSubtitle}>{error || "找不到活動"}</Text>
            <Button
              title="返回"
              onPress={() => router.back()}
              style={styles.errorButton}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const statusColor = getStatusColor(event.status);
  const progress = (event.current_participants / event.max_participants) * 100;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.iconButtonGlass}>
              <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>活動詳情</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Info */}
          <Card style={styles.mainCard}>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
                <Text style={[styles.badgeText, { color: statusColor.text }]}>
                  {event.status.toUpperCase()}
                </Text>
              </View>
              {event.visibility === "private" && (
                <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.05)" }]}>
                  <Text style={[styles.badgeText, { color: Colors.gray[600] }]}>
                    私人
                  </Text>
                </View>
              )}
              {event.duration_type === "permanent" && (
                <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.05)" }]}>
                  <Text style={[styles.badgeText, { color: Colors.gray[600] }]}>
                    定期
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{event.title}</Text>
            {event.description ? (
              <Text style={styles.description}>{event.description}</Text>
            ) : null}
          </Card>

          {/* Participants Info */}
          <Card style={styles.participantsCard}>
            <View style={styles.participantsHeader}>
              <Text style={styles.sectionTitle}>參加者</Text>
              {isOwner && event.participants.length > 1 && (
                <TouchableOpacity
                  style={styles.splitBillButton}
                  onPress={() => setSplitBillModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calculator" size={16} color={Colors.white} />
                  <Text style={styles.splitBillButtonText}>結算分帳</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.participantsInfo}>
              <Text style={styles.participantsCount}>
                {event.current_participants} / {event.max_participants} 已加入
              </Text>
              <Text style={styles.participantsPercentage}>
                {Math.round(progress)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, progress)}%`,
                    backgroundColor: progress >= 90 ? Colors.error[500] : Colors.primary,
                  },
                ]}
              />
            </View>

            {event.participants.length > 0 && (
              <View style={styles.participantsList}>
                {event.participants.map((participant) => (
                  <View key={participant.id} style={styles.participantItem}>
                    <View style={styles.participantAvatarContainer}>
                      <Text style={styles.participantAvatarText}>
                        {participant.display_name?.[0] || 'U'}
                      </Text>
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {participant.display_name}
                      </Text>
                      {participant.role === "owner" && (
                        <View style={styles.ownerBadge}>
                          <Text style={styles.ownerBadgeText}>主辦人</Text>
                        </View>
                      )}
                    </View>

                    {participant.role !== "owner" && (participant.amount_due > 0 || participant.payment_status === "paid") && (
                      <TouchableOpacity
                        disabled={!isOwner}
                        onPress={() => togglePaymentStatus(participant.id, participant.payment_status)}
                        style={[
                          styles.paymentBadge,
                          participant.payment_status === "paid" ? styles.paymentBadgePaid : styles.paymentBadgeUnpaid
                        ]}
                      >
                        <Text style={[
                          styles.paymentBadgeText,
                          participant.payment_status === "paid" ? styles.paymentBadgeTextPaid : styles.paymentBadgeTextUnpaid
                        ]}>
                          {participant.payment_status === "paid" ? "🟢 已付款" : `🔴 未付款 (${participant.amount_due}元)`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Location/Booking Info */}
          {event.bookings && event.bookings.length > 0 && (
            <Card style={styles.bookingsCard}>
              <Text style={styles.sectionTitle}>場地資訊</Text>
              {event.bookings.map((booking, index) => (
                <View key={booking.id} style={[styles.bookingItem, index > 0 && { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 }]}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.locationIconContainer}>
                      <Ionicons name="location" size={20} color={Colors.white} />
                    </View>
                    <Text style={styles.bookingVenue}>{booking.venue.name}</Text>
                  </View>
                  <Text style={styles.bookingCourt}>
                    {booking.court.name} - {booking.court.sport_type}
                  </Text>
                  <Text style={styles.bookingTime}>
                    {new Date(booking.time_slot.starts_at).toLocaleString()} -{" "}
                    {new Date(booking.time_slot.ends_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.bookingAddress}>
                    {booking.venue.address}, {booking.venue.city}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>

        {/* Footer Actions */}
        {joinStatus === 'none' && canJoin && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleJoin} disabled={isJoining} activeOpacity={0.8}>
              <LinearGradient
                colors={Colors.gradients.warmTech as [string, string]}
                style={styles.joinButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isJoining ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.joinButtonText}>加入活動</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {joinStatus === 'joined' && !isOwner && (
          <View style={styles.footer}>
            <View style={styles.joinedMessage}>
              <Ionicons name="checkmark-circle" size={24} color="#388E3C" />
              <Text style={styles.joinedText}>您已加入此活動！</Text>
            </View>
          </View>
        )}

        {joinStatus === 'pending' && !isOwner && (
          <View style={styles.footer}>
            <View style={[styles.joinedMessage, { backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 16 }]}>
              <Ionicons name="time" size={24} color="#F57C00" />
              <Text style={[styles.joinedText, { color: '#F57C00' }]}>請求審核中</Text>
            </View>
          </View>
        )}

        {/* Split Bill Modal */}
        <Modal
          visible={splitBillModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSplitBillModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>結算分帳</Text>
                <TouchableOpacity onPress={() => setSplitBillModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.gray[500]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalDescription}>
                請輸入本次活動的總花費 (例如：場地費 + 球錢)。系統會自動將金額平分給所有已加入的團員。
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="number-pad"
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  autoFocus
                />
              </View>

              <Button
                title={isSplitting ? "處理中..." : "開始平分"}
                onPress={handleSplitBill}
                disabled={!totalAmount || isSplitting}
                style={styles.submitSplitButton}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  iconButtonGlass: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.gray[900],
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 15,
    color: Colors.gray[600],
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 150,
  },
  mainCard: {
    marginBottom: 16,
    borderWidth: 0,
    backgroundColor: Colors.gray[50],
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.gray[900],
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.gray[700],
    lineHeight: 24,
  },
  participantsCard: {
    marginBottom: 16,
    borderWidth: 0,
    backgroundColor: Colors.gray[50],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.gray[900],
    marginBottom: 16,
  },
  participantsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  participantsCount: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.gray[800],
  },
  participantsPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  participantsList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  participantAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  participantInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  participantName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.gray[900],
  },
  ownerBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gray[700],
  },
  bookingsCard: {
    marginBottom: 16,
    borderWidth: 0,
    backgroundColor: Colors.gray[50],
  },
  bookingItem: {
    paddingVertical: 8,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingVenue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray[900],
  },
  bookingCourt: {
    fontSize: 15,
    color: Colors.gray[700],
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  bookingAddress: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  footer: {
    padding: 20,
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
  },
  joinButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  joinedMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  joinedText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#388E3C",
  },

  // Split Bill UI Styles
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  splitBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  splitBillButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  paymentBadgePaid: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  paymentBadgeUnpaid: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentBadgeTextPaid: {
    color: '#388E3C',
  },
  paymentBadgeTextUnpaid: {
    color: '#D32F2F',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: Colors.gray[50],
  },
  currencySymbol: {
    fontSize: 24,
    color: Colors.gray[600],
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gray[900],
    paddingVertical: 16,
  },
  submitSplitButton: {
    width: '100%',
  },
});
