import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import TeamUpCard from '../../components/TeamUpCard';
import { Colors } from '../../constants/Colors';

// Mock data for now
const mockTeamUps = [
  {
    id: '1',
    title: 'Basketball Game - Morning Session',
    description: 'Join us for a friendly basketball game at the community court. All skill levels welcome!',
    status: 'open',
    visibility: 'public',
    currentParticipants: 8,
    maxParticipants: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Weekend Soccer Match',
    description: 'Looking for players for a casual weekend soccer match.',
    status: 'open',
    visibility: 'public',
    currentParticipants: 15,
    maxParticipants: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Tennis Doubles Tournament',
    description: 'Competitive doubles tournament for intermediate players.',
    status: 'closed',
    visibility: 'private',
    currentParticipants: 8,
    maxParticipants: 8,
    createdAt: new Date().toISOString(),
  },
];

export default function TeamUpsScreen() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teamups, setTeamups] = useState(mockTeamUps);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    setIsLoading(true);
    // TODO: Implement actual search
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Discover TeamUps</Text>
            <Text style={styles.subtitle}>Find and join local sports activities</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.myTeamUpsButton}
            onPress={() => router.push('/(tabs)/my-teamups')}
          >
            <Ionicons name="person" size={18} color={Colors.gray[700]} />
            <Text style={styles.myTeamUpsText}>My TeamUps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/new-teamup')}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder='e.g., "basketball", "morning run"'
          value={keyword}
          onChangeText={setKeyword}
          style={styles.searchInput}
        />
        <Button
          title="Search"
          onPress={handleSearch}
          size="medium"
          style={styles.searchButton}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Loading TeamUps...</Text>
        </View>
      ) : teamups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color={Colors.gray[400]} />
          <Text style={styles.emptyTitle}>No TeamUps Found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your filters or create the first one!</Text>
          <Button
            title="Create Your First TeamUp"
            onPress={() => router.push('/(tabs)/new-teamup')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={teamups}
          renderItem={({ item }) => <TeamUpCard teamup={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTop: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  myTeamUpsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderRadius: 12,
    gap: 6,
  },
  myTeamUpsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.primary[600],
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  searchButton: {
    alignSelf: 'flex-start',
  },
  list: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
});
