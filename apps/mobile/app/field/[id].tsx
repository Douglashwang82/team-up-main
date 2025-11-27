import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';

// Mock field data based on the fields in map.tsx
const MOCK_FIELDS = [
  {
    id: '1',
    name: 'Central Park Basketball Court',
    sportType: 'Basketball',
    description: 'Outdoor basketball court with great facilities',
    address: 'Central Park Area, Taipei',
    facilities: ['Outdoor Court', 'Night Lighting', 'Free Access'],
    openingHours: '6:00 AM - 10:00 PM',
    rating: 4.5,
    icon: '🏀'
  },
  {
    id: '2',
    name: 'Riverside Soccer Field',
    sportType: 'Soccer',
    description: 'Full-size soccer field with night lighting',
    address: 'Riverside Park, Taipei',
    facilities: ['Full-size Field', 'Night Lighting', 'Changing Rooms'],
    openingHours: '7:00 AM - 9:00 PM',
    rating: 4.7,
    icon: '⚽'
  },
  {
    id: '3',
    name: 'Eastside Tennis Courts',
    sportType: 'Tennis',
    description: '4 tennis courts available for booking',
    address: 'Eastside Sports Complex, Taipei',
    facilities: ['4 Courts', 'Booking Required', 'Equipment Rental'],
    openingHours: '6:00 AM - 10:00 PM',
    rating: 4.3,
    icon: '🎾'
  },
  {
    id: '4',
    name: 'Valley Baseball Diamond',
    sportType: 'Baseball',
    description: 'Community baseball field with bleachers',
    address: 'Valley Park, Taipei',
    facilities: ['Diamond Field', 'Bleacher Seating', 'Dugouts'],
    openingHours: '8:00 AM - 8:00 PM',
    rating: 4.4,
    icon: '⚾'
  },
  {
    id: '5',
    name: 'Mountain View Volleyball Court',
    sportType: 'Volleyball',
    description: 'Beach volleyball court with sand',
    address: 'Mountain View Park, Taipei',
    facilities: ['Sand Court', 'Outdoor', 'Free Access'],
    openingHours: '7:00 AM - 7:00 PM',
    rating: 4.6,
    icon: '🏐'
  },
  {
    id: '6',
    name: 'Downtown Gym Complex',
    sportType: 'Multi-sport',
    description: 'Indoor facility for various sports',
    address: 'Downtown District, Taipei',
    facilities: ['Indoor', 'Multiple Sports', 'Membership Required'],
    openingHours: '6:00 AM - 11:00 PM',
    rating: 4.8,
    icon: '🏟️'
  },
  {
    id: '7',
    name: 'Lakefront Running Track',
    sportType: 'Track & Field',
    description: '400m running track with scenic views',
    address: 'Lakefront Park, Taipei',
    facilities: ['400m Track', 'Scenic Views', 'Free Access'],
    openingHours: '5:00 AM - 10:00 PM',
    rating: 4.9,
    icon: '🏃'
  },
  {
    id: '8',
    name: 'Oakwood Basketball Court',
    sportType: 'Basketball',
    description: 'Half-court basketball with recent upgrades',
    address: 'Oakwood Community Center, Taipei',
    facilities: ['Half Court', 'Recently Renovated', 'Free Access'],
    openingHours: '6:00 AM - 9:00 PM',
    rating: 4.2,
    icon: '🏀'
  },
  {
    id: '9',
    name: 'Community Soccer Complex',
    sportType: 'Soccer',
    description: 'Multiple soccer fields for all skill levels',
    address: 'Community Sports Park, Taipei',
    facilities: ['Multiple Fields', 'Youth Programs', 'Coaching Available'],
    openingHours: '7:00 AM - 10:00 PM',
    rating: 4.5,
    icon: '⚽'
  },
  {
    id: '10',
    name: 'West Park Fitness Area',
    sportType: 'Fitness',
    description: 'Outdoor fitness equipment and training area',
    address: 'West Park, Taipei',
    facilities: ['Outdoor Equipment', 'Training Area', 'Free Access'],
    openingHours: '24/7',
    rating: 4.1,
    icon: '💪'
  }
];

// Mock upcoming events data
const MOCK_EVENTS = [
  {
    id: '1',
    fieldId: '1',
    title: 'Morning Basketball Practice',
    date: new Date(Date.now() + 86400000), // Tomorrow
    participants: 8,
    maxParticipants: 10,
    organizer: 'John Doe'
  },
  {
    id: '2',
    fieldId: '1',
    title: '3v3 Basketball Tournament',
    date: new Date(Date.now() + 172800000), // 2 days
    participants: 12,
    maxParticipants: 12,
    organizer: 'Sarah Smith'
  },
  {
    id: '3',
    fieldId: '2',
    title: 'Weekly Soccer Match',
    date: new Date(Date.now() + 259200000), // 3 days
    participants: 15,
    maxParticipants: 20,
    organizer: 'Mike Johnson'
  },
  {
    id: '4',
    fieldId: '3',
    title: 'Tennis Doubles',
    date: new Date(Date.now() + 345600000), // 4 days
    participants: 4,
    maxParticipants: 4,
    organizer: 'Emily Chen'
  },
  {
    id: '5',
    fieldId: '7',
    title: 'Morning Run Club',
    date: new Date(Date.now() + 432000000), // 5 days
    participants: 6,
    maxParticipants: 15,
    organizer: 'David Lee'
  }
];

export default function FieldDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Find the field by id
  const field = MOCK_FIELDS.find(f => f.id === id) || MOCK_FIELDS[0];

  // Get upcoming events for this field
  const upcomingEvents = MOCK_EVENTS.filter(event => event.fieldId === id);

  const getSportTypeColor = (sportType: string) => {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      'Basketball': { bg: '#FFF3E0', text: '#E65100' },
      'Soccer': { bg: '#E8F5E9', text: '#2E7D32' },
      'Tennis': { bg: '#FFF9C4', text: '#F57F17' },
      'Baseball': { bg: '#F3E5F5', text: '#7B1FA2' },
      'Volleyball': { bg: '#E0F7FA', text: '#00838F' },
      'Multi-sport': { bg: '#EDE7F6', text: '#5E35B1' },
      'Track & Field': { bg: '#E3F2FD', text: '#1565C0' },
      'Fitness': { bg: '#FFEBEE', text: '#C62828' }
    };

    return colorMap[sportType] || { bg: Colors.gray[100], text: Colors.gray[700] };
  };

  const sportColor = getSportTypeColor(field.sportType);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`full-${i}`} name="star" size={16} color="#FFB300" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFB300" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFB300" />);
    }

    return stars;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.fieldIcon}>{field.icon}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: sportColor.bg }]}>
            <Text style={[styles.badgeText, { color: sportColor.text }]}>
              {field.sportType}
            </Text>
          </View>

          <Text style={styles.title}>{field.name}</Text>
          <Text style={styles.description}>{field.description}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(field.rating)}
            </View>
            <Text style={styles.ratingText}>{field.rating.toFixed(1)}</Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.gray[600]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{field.address}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={Colors.gray[600]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Opening Hours</Text>
              <Text style={styles.infoValue}>{field.openingHours}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.facilitiesCard}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.facilitiesList}>
            {field.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success[600]} />
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.eventsCard}>
          <View style={styles.eventsHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <Text style={styles.eventCount}>{upcomingEvents.length}</Text>
          </View>

          {upcomingEvents.length > 0 ? (
            <View style={styles.eventsList}>
              {upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventItem}
                  onPress={() => router.push(`/teamup/${event.id}`)}
                >
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDateDay}>
                      {event.date.getDate()}
                    </Text>
                    <Text style={styles.eventDateMonth}>
                      {event.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventMeta}>
                      <View style={styles.eventMetaItem}>
                        <Ionicons name="person-outline" size={14} color={Colors.gray[600]} />
                        <Text style={styles.eventMetaText}>
                          {event.participants}/{event.maxParticipants}
                        </Text>
                      </View>
                      <Text style={styles.eventMetaDivider}>•</Text>
                      <Text style={styles.eventOrganizer}>{event.organizer}</Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyEvents}>
              <Ionicons name="calendar-outline" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyEventsText}>No upcoming events</Text>
              <Text style={styles.emptyEventsSubtext}>Be the first to create one!</Text>
            </View>
          )}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Create Event"
          onPress={() => router.push({
            pathname: '/(tabs)/new-teamup',
            params: { fieldId: field.id, fieldName: field.name }
          })}
          fullWidth
          size="large"
          icon={<Ionicons name="add-circle-outline" size={20} color={Colors.white} />}
        />
        <View style={styles.footerSpacer} />
        <Button
          title="View on Map"
          onPress={() => router.back()}
          fullWidth
          size="large"
          variant="outline"
          icon={<Ionicons name="map-outline" size={20} color={Colors.primary[600]} />}
        />
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
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  fieldIcon: {
    fontSize: 64,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.gray[600],
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
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
  facilitiesCard: {
    marginBottom: 16,
  },
  facilitiesList: {
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  facilityText: {
    fontSize: 16,
    color: Colors.gray[700],
  },
  eventsCard: {
    marginBottom: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  eventDateBadge: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary[600],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
    marginTop: -2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 13,
    color: Colors.gray[600],
  },
  eventMetaDivider: {
    fontSize: 13,
    color: Colors.gray[400],
  },
  eventOrganizer: {
    fontSize: 13,
    color: Colors.gray[600],
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyEventsText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[600],
    marginTop: 12,
  },
  emptyEventsSubtext: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  footerSpacer: {
    height: 12,
  },
});
