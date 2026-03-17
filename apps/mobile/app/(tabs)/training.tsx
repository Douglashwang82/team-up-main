import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "beginner" | "intermediate" | "advanced";
type Sport = "all" | "basketball" | "soccer" | "tennis" | "fitness" | "volleyball";

interface TrainingPlan {
  id: string;
  name: string;
  sport: Sport;
  difficulty: Difficulty;
  sessionsPerWeek: number;
  durationWeeks: number;
  description: string;
  tags: string[];
  enrolled: boolean;
  progress?: number;
  gradient: string[];
  icon: keyof typeof Ionicons.glyphMap;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const TRAINING_PLANS: TrainingPlan[] = [
  {
    id: "1",
    name: "籃球新手入門",
    sport: "basketball",
    difficulty: "beginner",
    sessionsPerWeek: 3,
    durationWeeks: 4,
    description: "從基礎運球、投籃姿勢到簡單進攻戰術，適合剛接觸籃球的新手。",
    tags: ["運球", "投籃", "防守基礎"],
    enrolled: true,
    progress: 45,
    gradient: ["#F97316", "#FB923C"],
    icon: "basketball-outline",
  },
  {
    id: "2",
    name: "籃球進階提升",
    sport: "basketball",
    difficulty: "intermediate",
    sessionsPerWeek: 4,
    durationWeeks: 6,
    description: "強化切入、三分球命中率及快攻銜接，全面提升比賽競爭力。",
    tags: ["三分球", "切入", "快攻"],
    enrolled: false,
    gradient: ["#F97316", "#EF4444"],
    icon: "basketball-outline",
  },
  {
    id: "3",
    name: "足球體能強化",
    sport: "soccer",
    difficulty: "intermediate",
    sessionsPerWeek: 4,
    durationWeeks: 8,
    description: "針對足球員設計的有氧與無氧體能訓練，提升90分鐘比賽持久力。",
    tags: ["有氧體能", "爆發力", "核心訓練"],
    enrolled: true,
    progress: 70,
    gradient: ["#22c55e", "#16a34a"],
    icon: "football-outline",
  },
  {
    id: "4",
    name: "網球技術精進",
    sport: "tennis",
    difficulty: "advanced",
    sessionsPerWeek: 5,
    durationWeeks: 10,
    description: "系統化訓練發球、底線對打及網前截擊技術，向職業水準邁進。",
    tags: ["發球", "底線", "截擊"],
    enrolled: false,
    gradient: ["#0EA5E9", "#3B82F6"],
    icon: "tennisball-outline",
  },
  {
    id: "5",
    name: "全身功能性健身",
    sport: "fitness",
    difficulty: "beginner",
    sessionsPerWeek: 3,
    durationWeeks: 6,
    description: "結合自重訓練與功能性動作，打造均衡的體態與運動能力基礎。",
    tags: ["自重訓練", "核心", "柔韌度"],
    enrolled: false,
    gradient: ["#8B5CF6", "#EC4899"],
    icon: "barbell-outline",
  },
  {
    id: "6",
    name: "排球攻守整合",
    sport: "volleyball",
    difficulty: "intermediate",
    sessionsPerWeek: 3,
    durationWeeks: 6,
    description: "從接發球、二傳到扣殺，系統性培養全場技術。",
    tags: ["發球接收", "二傳", "扣殺"],
    enrolled: false,
    gradient: ["#F59E0B", "#F97316"],
    icon: "american-football-outline",
  },
  {
    id: "7",
    name: "高強度間歇訓練",
    sport: "fitness",
    difficulty: "advanced",
    sessionsPerWeek: 5,
    durationWeeks: 4,
    description: "最大心率訓練法，短時間內燃燒脂肪並大幅提升心肺耐力。",
    tags: ["HIIT", "有氧", "燃脂"],
    enrolled: false,
    gradient: ["#EF4444", "#F97316"],
    icon: "flame-outline",
  },
];

// ─── Filter Config ─────────────────────────────────────────────────────────────

const FILTERS: { key: Sport; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "all", label: "全部", icon: "grid-outline" },
  { key: "basketball", label: "籃球", icon: "basketball-outline" },
  { key: "soccer", label: "足球", icon: "football-outline" },
  { key: "tennis", label: "網球", icon: "tennisball-outline" },
  { key: "fitness", label: "健身", icon: "barbell-outline" },
  { key: "volleyball", label: "排球", icon: "american-football-outline" },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bg: string }> = {
  beginner: { label: "入門", color: Colors.success[700], bg: Colors.success[100] },
  intermediate: { label: "進階", color: "#b45309", bg: Colors.warning[100] },
  advanced: { label: "高階", color: Colors.error[700], bg: Colors.error[100] },
};

// ─── Active Plan Card ──────────────────────────────────────────────────────────

function ActivePlanCard({ plan }: { plan: TrainingPlan }) {
  const diff = DIFFICULTY_CONFIG[plan.difficulty];
  return (
    <TouchableOpacity style={styles.activePlanCard} activeOpacity={0.85}>
      <LinearGradient colors={plan.gradient as any} style={styles.activePlanGradient}>
        <View style={styles.activePlanHeader}>
          <View style={styles.activePlanIconCircle}>
            <Ionicons name={plan.icon} size={22} color="#fff" />
          </View>
          <View style={[styles.diffBadgeSmall, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={[styles.diffBadgeText, { color: "#fff" }]}>{diff.label}</Text>
          </View>
        </View>

        <Text style={styles.activePlanName}>{plan.name}</Text>
        <Text style={styles.activePlanMeta}>
          {plan.sessionsPerWeek}次/週 · {plan.durationWeeks}週計畫
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${plan.progress ?? 0}%` }]} />
        </View>
        <Text style={styles.activePlanProgress}>{plan.progress}% 完成</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: TrainingPlan }) {
  const diff = DIFFICULTY_CONFIG[plan.difficulty];
  return (
    <TouchableOpacity style={styles.planCard} activeOpacity={0.85}>
      {/* Left color accent */}
      <LinearGradient
        colors={plan.gradient as any}
        style={styles.planCardAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={styles.planCardContent}>
        {/* Icon + Difficulty */}
        <View style={styles.planCardTopRow}>
          <View style={[styles.planIconCircle, { backgroundColor: plan.gradient[0] + "20" }]}>
            <Ionicons name={plan.icon} size={18} color={plan.gradient[0]} />
          </View>
          <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
            <Text style={[styles.diffBadgeText, { color: diff.color }]}>{diff.label}</Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.planCardTitle}>{plan.name}</Text>
        <Text style={styles.planCardDesc} numberOfLines={2}>{plan.description}</Text>

        {/* Tags */}
        <View style={styles.tagRow}>
          {plan.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.planCardFooter}>
          <View style={styles.planCardMeta}>
            <Ionicons name="time-outline" size={14} color={Colors.gray[500]} />
            <Text style={styles.planCardMetaText}>{plan.durationWeeks} 週</Text>
          </View>
          <View style={styles.planCardMeta}>
            <Ionicons name="repeat-outline" size={14} color={Colors.gray[500]} />
            <Text style={styles.planCardMetaText}>{plan.sessionsPerWeek} 次/週</Text>
          </View>
          <TouchableOpacity
            style={[styles.enrollBtn, plan.enrolled && styles.enrollBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.enrollBtnText, plan.enrolled && styles.enrollBtnTextActive]}>
              {plan.enrolled ? "進行中" : "加入計畫"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function TrainingScreen() {
  const [activeFilter, setActiveFilter] = useState<Sport>("all");

  const activePlans = TRAINING_PLANS.filter((p) => p.enrolled);
  const filteredPlans = TRAINING_PLANS.filter(
    (p) => (activeFilter === "all" || p.sport === activeFilter) && !p.enrolled
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>訓練計畫</Text>
            <Text style={styles.headerSubtitle}>精選專項課表，系統提升競技水準</Text>
          </View>
          <TouchableOpacity style={styles.headerSearchBtn}>
            <Ionicons name="search-outline" size={22} color={Colors.gray[700]} />
          </TouchableOpacity>
        </View>

        {/* ── Active Plans ── */}
        {activePlans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>進行中</Text>
              <Text style={styles.sectionCount}>{activePlans.length}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activePlanList}
            >
              {activePlans.map((plan) => (
                <ActivePlanCard key={plan.id} plan={plan} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScroll}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.75}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            >
              <Ionicons
                name={f.icon}
                size={15}
                color={activeFilter === f.key ? Colors.white : Colors.gray[600]}
              />
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Recommended Plans ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>推薦計畫</Text>
            <Text style={styles.sectionCount}>{filteredPlans.length}</Text>
          </View>

          {filteredPlans.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={52} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>此分類暫無計畫</Text>
              <Text style={styles.emptySubtitle}>請切換其他運動類別查看</Text>
            </View>
          ) : (
            filteredPlans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
          )}
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.gray[900],
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  headerSearchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardbase,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  // Section
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray[900],
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray[400],
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  // Active Plan Card
  activePlanList: {
    gap: 12,
    paddingRight: 4,
  },
  activePlanCard: {
    width: SCREEN_WIDTH * 0.68,
    borderRadius: 18,
    overflow: "hidden",
  },
  activePlanGradient: {
    padding: 18,
    gap: 6,
  },
  activePlanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  activePlanIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  diffBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activePlanName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  activePlanMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  progressBarBg: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 5,
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  activePlanProgress: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },

  // Filters
  filterScroll: {
    marginTop: 16,
  },
  filterContainer: {
    gap: 8,
    paddingRight: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray[600],
  },
  filterChipTextActive: {
    color: Colors.white,
  },

  // Plan Card
  planCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  planCardAccent: {
    width: 5,
  },
  planCardContent: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  planCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  planCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.gray[900],
  },
  planCardDesc: {
    fontSize: 13,
    color: Colors.gray[500],
    lineHeight: 19,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.cardbase,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: Colors.gray[600],
    fontWeight: "500",
  },
  planCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  planCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  planCardMetaText: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  enrollBtn: {
    marginLeft: "auto",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  enrollBtnActive: {
    backgroundColor: Colors.primary + "18",
    borderColor: Colors.primary,
  },
  enrollBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  enrollBtnTextActive: {
    color: Colors.primary,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[500],
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.gray[400],
  },
});
