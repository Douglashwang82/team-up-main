import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

// Mock field data interface
interface Field {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sportType: string;
  description: string;
}

// Function to generate mock field locations near a given position
const generateMockFields = (centerLat: number, centerLng: number): Field[] => {
  const fields: Field[] = [
    {
      id: '1',
      name: 'Central Park Basketball Court',
      latitude: centerLat + 0.01,
      longitude: centerLng + 0.01,
      sportType: 'Basketball',
      description: 'Outdoor basketball court with great facilities'
    },
    {
      id: '2',
      name: 'Riverside Soccer Field',
      latitude: centerLat - 0.01,
      longitude: centerLng + 0.015,
      sportType: 'Soccer',
      description: 'Full-size soccer field with night lighting'
    },
    {
      id: '3',
      name: 'Eastside Tennis Courts',
      latitude: centerLat + 0.015,
      longitude: centerLng - 0.01,
      sportType: 'Tennis',
      description: '4 tennis courts available for booking'
    },
    {
      id: '4',
      name: 'Valley Baseball Diamond',
      latitude: centerLat - 0.015,
      longitude: centerLng - 0.01,
      sportType: 'Baseball',
      description: 'Community baseball field with bleachers'
    },
    {
      id: '5',
      name: 'Mountain View Volleyball Court',
      latitude: centerLat + 0.008,
      longitude: centerLng + 0.018,
      sportType: 'Volleyball',
      description: 'Beach volleyball court with sand'
    },
    {
      id: '6',
      name: 'Downtown Gym Complex',
      latitude: centerLat - 0.008,
      longitude: centerLng - 0.018,
      sportType: 'Multi-sport',
      description: 'Indoor facility for various sports'
    },
    {
      id: '7',
      name: 'Lakefront Running Track',
      latitude: centerLat + 0.012,
      longitude: centerLng - 0.015,
      sportType: 'Track & Field',
      description: '400m running track with scenic views'
    },
    {
      id: '8',
      name: 'Oakwood Basketball Court',
      latitude: centerLat - 0.012,
      longitude: centerLng + 0.012,
      sportType: 'Basketball',
      description: 'Half-court basketball with recent upgrades'
    },
    {
      id: '9',
      name: 'Community Soccer Complex',
      latitude: centerLat + 0.018,
      longitude: centerLng + 0.008,
      sportType: 'Soccer',
      description: 'Multiple soccer fields for all skill levels'
    },
    {
      id: '10',
      name: 'West Park Fitness Area',
      latitude: centerLat - 0.018,
      longitude: centerLng - 0.008,
      sportType: 'Fitness',
      description: 'Outdoor fitness equipment and training area'
    }
  ];

  return fields;
};

// Sport type options
const SPORT_TYPES = [
  'All',
  'Basketball',
  'Soccer',
  'Tennis',
  'Baseball',
  'Volleyball',
  'Multi-sport',
  'Track & Field',
  'Fitness'
];

// Function to get marker color based on sport type
const getSportTypeColor = (sportType: string): string => {
  const colorMap: { [key: string]: string } = {
    'Basketball': 'orange',
    'Soccer': 'green',
    'Tennis': 'yellow',
    'Baseball': 'purple',
    'Volleyball': 'cyan',
    'Multi-sport': 'violet',
    'Track & Field': 'blue',
    'Fitness': 'tomato'
  };

  return colorMap[sportType] || 'green';
};

// Function to get emoji icon based on sport type
const getSportTypeIcon = (sportType: string): string => {
  const iconMap: { [key: string]: string } = {
    'Basketball': '🏀',
    'Soccer': '⚽',
    'Tennis': '🎾',
    'Baseball': '⚾',
    'Volleyball': '🏐',
    'Multi-sport': '🏟️',
    'Track & Field': '🏃',
    'Fitness': '💪'
  };

  return iconMap[sportType] || '📍';
};

// Common locations for autocomplete fallback
const COMMON_LOCATIONS = [
  'Times Square, New York, NY',
  'Central Park, New York, NY',
  'Golden Gate Bridge, San Francisco, CA',
  'Hollywood Sign, Los Angeles, CA',
  'Navy Pier, Chicago, IL',
  'Space Needle, Seattle, WA',
  'Freedom Tower, New York, NY',
  'Lincoln Memorial, Washington, DC',
  'Statue of Liberty, New York, NY',
  'Empire State Building, New York, NY',
  'Fenway Park, Boston, MA',
  'Pike Place Market, Seattle, WA',
  'Union Square, San Francisco, CA',
  'Miami Beach, Miami, FL',
  'Las Vegas Strip, Las Vegas, NV'
];

// Autocomplete suggestion interface
interface AutocompleteSuggestion {
  address: string;
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [mockFields, setMockFields] = useState<Field[]>([]);
  const [selectedSportType, setSelectedSportType] = useState<string>('All');
  const [showSportTypeModal, setShowSportTypeModal] = useState<boolean>(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      // Request location permissions (still needed for showsUserLocation on map)
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      // Set default address to 台北市台灣大學 (National Taiwan University)
      const defaultAddress = '台北市台灣大學';
      try {
        const geocoded = await Location.geocodeAsync(defaultAddress);
        if (geocoded.length > 0) {
          const defaultLocation = geocoded[0];
          
          // Create a mock location object to replace getCurrentPositionAsync
          const mockLocation: Location.LocationObject = {
            coords: {
              latitude: defaultLocation.latitude,
              longitude: defaultLocation.longitude,
              altitude: null,
              accuracy: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          };
          
          setLocation(mockLocation);
          
          setSearchResult({
            latitude: defaultLocation.latitude,
            longitude: defaultLocation.longitude,
            address: defaultAddress,
          });
          setSearchAddress(defaultAddress);
          
          // Generate mock fields near the default location
          const fields = generateMockFields(
            defaultLocation.latitude,
            defaultLocation.longitude
          );
          setMockFields(fields);
        }
      } catch (error) {
        console.error('Error geocoding default address:', error);
        setErrorMsg('Failed to set default location');
      }
    })();
  }, []);

  // Autocomplete effect with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchAddress.trim() && searchAddress.length > 2) {
        // First, filter common locations based on search input
        const searchLower = searchAddress.toLowerCase();
        const filteredLocations = COMMON_LOCATIONS.filter(location =>
          location.toLowerCase().includes(searchLower)
        ).slice(0, 5);

        if (filteredLocations.length > 0) {
          // Show filtered common locations immediately
          const suggestions: AutocompleteSuggestion[] = [];

          for (const location of filteredLocations) {
            try {
              const geocoded = await Location.geocodeAsync(location);
              if (geocoded.length > 0) {
                suggestions.push({
                  address: location,
                  latitude: geocoded[0].latitude,
                  longitude: geocoded[0].longitude,
                });
              }
            } catch (error) {
              console.error('Error geocoding common location:', error);
            }
          }

          if (suggestions.length > 0) {
            setAutocompleteSuggestions(suggestions);
            setShowAutocomplete(true);
          } else {
            setAutocompleteSuggestions([]);
            setShowAutocomplete(false);
          }
        } else {
          // Fallback: try geocoding the user's input
          try {
            const geocoded = await Location.geocodeAsync(searchAddress);

            if (geocoded.length > 0) {
              const suggestions: AutocompleteSuggestion[] = [];

              for (let i = 0; i < Math.min(3, geocoded.length); i++) {
                const result = geocoded[i];
                try {
                  const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: result.latitude,
                    longitude: result.longitude,
                  });

                  if (reverseGeocode.length > 0) {
                    const location = reverseGeocode[0];
                    const addressParts = [
                      location.name,
                      location.street,
                      location.city,
                      location.region,
                      location.country,
                    ].filter(Boolean);

                    const formattedAddress = addressParts.join(', ') || searchAddress;

                    suggestions.push({
                      address: formattedAddress,
                      latitude: result.latitude,
                      longitude: result.longitude,
                    });
                  }
                } catch (reverseError) {
                  console.error('Reverse geocoding error:', reverseError);
                  suggestions.push({
                    address: `${searchAddress} (Result ${i + 1})`,
                    latitude: result.latitude,
                    longitude: result.longitude,
                  });
                }
              }

              if (suggestions.length > 0) {
                setAutocompleteSuggestions(suggestions);
                setShowAutocomplete(true);
              } else {
                setAutocompleteSuggestions([]);
                setShowAutocomplete(false);
              }
            } else {
              setAutocompleteSuggestions([]);
              setShowAutocomplete(false);
            }
          } catch (error) {
            console.error('Autocomplete error:', error);
            setAutocompleteSuggestions([]);
            setShowAutocomplete(false);
          }
        }
      } else {
        setAutocompleteSuggestions([]);
        setShowAutocomplete(false);
      }
    }, 300); // 300ms debounce for faster response

    return () => clearTimeout(delayDebounceFn);
  }, [searchAddress]);

  // Handler for selecting an autocomplete suggestion
  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    setSearchAddress(suggestion.address);
    setSearchResult({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      address: suggestion.address,
    });
    setShowAutocomplete(false);
    setAutocompleteSuggestions([]);

    // Generate mock fields around the new location
    const fields = generateMockFields(
      suggestion.latitude,
      suggestion.longitude
    );
    setMockFields(fields);
  };

  // Function to search for address and convert to coordinates
  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      Alert.alert('Error', 'Please enter an address to search');
      return;
    }

    try {
      // Use Expo Location geocoding to convert address to coordinates
      const geocoded = await Location.geocodeAsync(searchAddress);

      if (geocoded.length > 0) {
        const result = geocoded[0];
        const newSearchResult = {
          latitude: result.latitude,
          longitude: result.longitude,
          address: searchAddress,
        };

        setSearchResult(newSearchResult);

        // Generate mock fields around the new location
        const fields = generateMockFields(
          result.latitude,
          result.longitude
        );
        setMockFields(fields);

        // Optional: Clear the search input after successful search
        // setSearchAddress('');
      } else {
        Alert.alert('Not Found', 'Could not find the specified address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to search for the address. Please try again.');
    }
  };

  // Default initial region (National Taiwan University)
  const initialRegion = {
    latitude: location?.coords.latitude || 25.0174,
    longitude: location?.coords.longitude || 121.5397,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Current region to show (prioritize search result, then current location, then default)
  const currentRegion = searchResult
    ? {
        latitude: searchResult.latitude,
        longitude: searchResult.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : initialRegion;

  // Filter fields based on selected sport type
  const filteredFields = selectedSportType === 'All'
    ? mockFields
    : mockFields.filter(field => field.sportType === selectedSportType);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={currentRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* Current location marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            description="Current location"
            pinColor="blue"
          />
        )}

        {/* Search result marker */}
        {searchResult && (
          <Marker
            coordinate={{
              latitude: searchResult.latitude,
              longitude: searchResult.longitude,
            }}
            title="Search Result"
            description={searchResult.address}
            pinColor="red"
          />
        )}

        {/* Mock field markers */}
        {filteredFields.map((field) => (
          <Marker
            key={field.id}
            coordinate={{
              latitude: field.latitude,
              longitude: field.longitude,
            }}
          >
            <View style={styles.customMarker}>
              <Text style={styles.markerIcon}>{getSportTypeIcon(field.sportType)}</Text>
            </View>
            <Callout
              onPress={() => router.push(`/field/${field.id}`)}
              style={styles.callout}
            >
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{field.name}</Text>
                <Text style={styles.calloutSportType}>{field.sportType}</Text>
                <Text style={styles.calloutDescription} numberOfLines={2}>
                  {field.description}
                </Text>
                <View style={styles.calloutFooter}>
                  <Text style={styles.calloutLink}>Tap for details</Text>
                  <Text style={styles.calloutArrow}>→</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Search input overlay */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search address (e.g., Times Square, New York)"
          style={styles.searchInput}
          value={searchAddress}
          onChangeText={setSearchAddress}
          onSubmitEditing={searchLocation}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchLocation}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Autocomplete dropdown */}
      {/* {showAutocomplete && autocompleteSuggestions.length > 0 && (
        <View style={styles.autocompleteContainer}>
          <ScrollView style={styles.autocompleteScrollView}>
            {autocompleteSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.autocompleteSuggestion}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <Text style={styles.autocompleteSuggestionText}>
                  {suggestion.address}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )} */}

      {/* Sport type filter dropdown */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSportTypeModal(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedSportType === 'All' ? 'Filter by Sport' : selectedSportType}
          </Text>
          <Text style={styles.filterButtonIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Sport type selection modal */}
      <Modal
        visible={showSportTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSportTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSportTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sport Type</Text>
            <ScrollView style={styles.modalScrollView}>
              {SPORT_TYPES.map((sportType) => (
                <TouchableOpacity
                  key={sportType}
                  style={[
                    styles.sportTypeOption,
                    selectedSportType === sportType && styles.sportTypeOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedSportType(sportType);
                    setShowSportTypeModal(false);
                  }}
                >
                  <Text style={[
                    styles.sportTypeOptionText,
                    selectedSportType === sportType && styles.sportTypeOptionTextSelected
                  ]}>
                    {sportType}
                  </Text>
                  {selectedSportType === sportType && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 95,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 1000,
  },
  autocompleteScrollView: {
    maxHeight: 200,
  },
  autocompleteSuggestion: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  autocompleteSuggestionText: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: 'red',
    padding: 20,
  },
  filterContainer: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  filterButtonIcon: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  sportTypeOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportTypeOptionSelected: {
    backgroundColor: '#e6f2ff',
  },
  sportTypeOptionText: {
    fontSize: 16,
    color: '#333',
  },
  sportTypeOptionTextSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  customMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 24,
  },
  callout: {
    width: 250,
  },
  calloutContainer: {
    padding: 12,
    width: 250,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutSportType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 6,
  },
  calloutDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  calloutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  calloutLink: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  calloutArrow: {
    fontSize: 16,
    color: '#007AFF',
  },
});
