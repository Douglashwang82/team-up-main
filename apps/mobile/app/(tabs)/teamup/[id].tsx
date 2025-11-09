import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Colors } from '../../../constants/Colors';

export default function TeamUpDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [hasJoined, setHasJoined] = useState(false);

  // Mock data - would come from API in real implementation
  const teamup = {
    id: id as string,
    title: 'Basketball Game - Morning Session',
    description: 'Join us for a friendly basketball game at the community court. All skill levels welcome! We play every Saturday morning and focus on having fun while getting some exercise.',
    status: 'open',
    visibility: 'public',
    currentParticipants: 8,
    maxParticipants: 10,
    createdAt: new Date().toISOString(),
    organizer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    venue: {
      name: 'Community Sports Center',
      address: '123 Main St, City, State',
    },
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 90000000).toISOString(),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: Colors.success[100], text: Colors.success[700] };
      case 'closed':
        return { bg: Colors.primary[100], text: Colors.primary[700] };
      default:
        return { bg: Colors.gray[100], text: Colors.gray[700] };
    }
  };

  const statusColor = getStatusColor(teamup.status);
  const progress = (teamup.currentParticipants / teamup.maxParticipants) * 100;

  const handleJoin = () => {
    // TODO: Implement actual join logic
    setHasJoined(!hasJoined);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TeamUp Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.badgeText, { color: statusColor.text }]}>
                {teamup.status.toUpperCase()}
              </Text>
            </View>
            {teamup.visibility === 'private' && (
              <View style={[styles.badge, { backgroundColor: Colors.gray[100] }]}>
                <Text style={[styles.badgeText, { color: Colors.gray[700] }]}>PRIVATE</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{teamup.title}</Text>
          <Text style={styles.description}>{teamup.description}</Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.gray[600]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>
                {new Date(teamup.startTime).toLocaleDateString()} at{' '}
                {new Date(teamup.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.gray[600]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{teamup.venue.name}</Text>
              <Text style={styles.infoSubValue}>{teamup.venue.address}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={Colors.gray[600]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Organizer</Text>
              <Text style={styles.infoValue}>{teamup.organizer.name}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.participantsCard}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsCount}>
              {teamup.currentParticipants} / {teamup.maxParticipants} joined
            </Text>
            <Text style={styles.participantsPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: progress >= 90 ? Colors.error[500] : Colors.primary[600],
                },
              ]}
            />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        {teamup.status === 'open' && (
          <Button
            title={hasJoined ? 'Leave TeamUp' : 'Join TeamUp'}
            onPress={handleJoin}
            fullWidth
            size="large"
            variant={hasJoined ? 'outline' : 'primary'}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  mainCard: {
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.gray[600],
    lineHeight: 24,
  },
  infoCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.gray[900],
    fontWeight: '500',
  },
  infoSubValue: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 2,
  },
  participantsCard: {
    marginBottom: 16,
  },
  participantsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  participantsPercentage: {
    fontSize: 14,
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
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
});
