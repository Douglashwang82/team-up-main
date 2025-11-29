import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Card from './Card';
import { Colors } from '../constants/Colors';

interface TeamUpCardProps {
  teamup: {
    id: string;
    title: string;
    description?: string;
    status: string;
    visibility: string;
    currentParticipants: number;
    maxParticipants: number;
    createdAt: string;
  };
}

export default function TeamUpCard({ teamup }: TeamUpCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: Colors.success[100], text: Colors.success[700], border: Colors.success[500] };
      case 'closed':
        return { bg: Colors.primary[100], text: Colors.primary[700], border: Colors.primary[500] };
      default:
        return { bg: Colors.gray[100], text: Colors.gray[700], border: Colors.gray[500] };
    }
  };

  const getProgressPercentage = () => {
    return Math.min((teamup.currentParticipants / teamup.maxParticipants) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return Colors.error[500];
    if (percentage >= 70) return Colors.warning[500];
    return Colors.primary[600];
  };

  const statusColor = getStatusColor(teamup.status);
  const progress = getProgressPercentage();
  const progressColor = getProgressColor(progress);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/teamup/${teamup.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
            <Text style={[styles.badgeText, { color: statusColor.text }]}>
              {teamup.status.toUpperCase()}
            </Text>
          </View>
          {teamup.visibility === 'private' && (
            <View style={[styles.badge, { backgroundColor: Colors.gray[100], borderColor: Colors.gray[500] }]}>
              <Text style={[styles.badgeText, { color: Colors.gray[700] }]}>PRIVATE</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {teamup.title}
        </Text>

        {teamup.description && (
          <Text style={styles.description} numberOfLines={2}>
            {teamup.description}
          </Text>
        )}

        <Text style={styles.date}>
          {new Date(teamup.createdAt).toLocaleDateString()}
        </Text>

        <View style={styles.participants}>
          <View style={styles.participantsHeader}>
            <Text style={styles.participantsText}>
              {teamup.currentParticipants}/{teamup.maxParticipants} Participants
            </Text>
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progressColor }]}
            />
          </View>
          {progress >= 90 && (
            <Text style={styles.almostFull}>Almost full!</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 12,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 12,
  },
  participants: {
    marginTop: 4,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  almostFull: {
    fontSize: 11,
    color: Colors.error[700],
    fontWeight: '500',
    marginTop: 4,
  },
});
