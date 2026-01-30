import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";

// Venue interface matching API response
interface Venue {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  distance_meters?: number;
}

// Google Places Autocomplete prediction interface
interface PlacePrediction {
  description: string;
  place_id: string;
}

import { apis } from "../../lib/api";

// Sport type options
const SPORT_TYPES = [
  "All",
  "Basketball",
  "Soccer",
  "Tennis",
  "Baseball",
  "Volleyball",
  "Multi-sport",
  "Track & Field",
  "Fitness",
];

// Sport type labels for display
const SPORT_TYPE_LABELS: Record<string, string> = {
  All: "全部",
  Basketball: "籃球",
  Soccer: "足球",
  Tennis: "網球",
  Baseball: "棒球",
  Volleyball: "排球",
  "Multi-sport": "綜合運動",
  "Track & Field": "田徑",
  Fitness: "健身",
};

// Function to get sport type icon emoji
const getSportTypeIcon = (sportType: string): string => {
  const iconMap: { [key: string]: string } = {
    Basketball: "🏀",
    Soccer: "⚽",
    Tennis: "🎾",
    Baseball: "⚾",
    Volleyball: "🏐",
    "Multi-sport": "🏟️",
    "Track & Field": "🏃",
    Fitness: "💪",
  };

  return iconMap[sportType] || "📍";
};

// IMPORTANT: Replace with your actual Google Maps API Key
// Get it from: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = "AIzaSyCQpRkPBlpr47iTciS2-3IEjzRD57XCA8I";

const DEFAULT_LAT = 25.013958087753082;
const DEFAULT_LNG = 121.53783024593216;

// Helper function to lighten a hex color
const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    Math.floor((num >> 16) + ((255 - (num >> 16)) * percent) / 100),
  );
  const g = Math.min(
    255,
    Math.floor(
      ((num >> 8) & 0x00ff) + ((255 - ((num >> 8) & 0x00ff)) * percent) / 100,
    ),
  );
  const b = Math.min(
    255,
    Math.floor((num & 0x0000ff) + ((255 - (num & 0x0000ff)) * percent) / 100),
  );
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

// Map colors based on design requirements
const MAP_COLORS = {
  primary: Colors.primary, // #FB5631 - for markers
  lighter1: lightenColor(Colors.primary, 40), // Lighter 1 level for blocks
  lighter2: lightenColor(Colors.primary, 60), // Lighter 2 level for blocks
  road: "#ffffff", // White for roads
};

// Custom map style with design requirements
const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.lighter2 }], // Background/base geometry - lighter 2
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#666666" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: MAP_COLORS.lighter2 }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.lighter1 }], // Administrative areas - lighter 1
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#888888" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#666666" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.lighter1 }], // POI blocks - lighter 1
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#888888" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.lighter2 }], // Parks - lighter 2
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#999999" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: MAP_COLORS.road }], // Roads - white
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: MAP_COLORS.lighter1 }, { weight: 0.5 }], // Road borders
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#666666" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.road }], // Arterial roads - white
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.road }], // Highways - white
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.road }], // Controlled access highways - white
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.road }], // Local roads - white
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#888888" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: MAP_COLORS.lighter1 }], // Transit - lighter 1
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#888888" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: lightenColor(Colors.primary, 80) }], // Water - very light primary
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#999999" }],
  },
];

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>({
    coords: {
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LNG,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState<string>("");
  const [searchResult, setSearchResult] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedSportType, setSelectedSportType] = useState<string>("All");
  const [showSportTypeModal, setShowSportTypeModal] = useState<boolean>(false);
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>(
    [],
  );
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  // Fetch venues when location changes or on mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const lat = location?.coords.latitude || DEFAULT_LAT;
        const lng = location?.coords.longitude || DEFAULT_LNG;

        const response = await apis.venues.searchVenues({
          lat: lat,
          lng: lng,
          distance: 10000, // 10km radius
          sportType:
            selectedSportType === "All" ? undefined : selectedSportType,
        });

        // Map API response to Venue interface
        // Note: The API response structure depends on the backend.
        // Based on routes/venues.py, it returns a list of objects with "venue" and "time_slots" keys
        // or just a list of venues if we update the client.
        // Let's assume the generated client returns what the backend sends.

        // @ts-ignore - The generated client types might not be fully up to date with our backend changes yet
        const mappedVenues = response
          .map((item: any) => {
            // Handle both structure with distance (from search) and direct list
            const v = item.venue || item;
            return {
              id: v.id,
              name: v.name,
              latitude: v.latitude || lat, // Fallback to center if missing (shouldn't happen with our backend fix)
              longitude: v.longitude || lng,
              address: v.address,
              city: v.city,
              distance_meters: item.distance_meters,
            };
          })
          .filter((v: Venue) => v.latitude && v.longitude);

        setVenues(mappedVenues);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };

    fetchVenues();
  }, [location, selectedSportType]);

  // Initialize location on mount
  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      try {
        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        console.error("Error getting location:", error);
        // Fallback to default location is already set in initial state
        // But we can reset it here if needed, or just log the error

        // We don't need to do anything here since we initialized with default values
        // But if we want to be explicit:
        const mockLocation: Location.LocationObject = {
          coords: {
            latitude: DEFAULT_LAT,
            longitude: DEFAULT_LNG,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };

        setLocation(mockLocation);
      }
    })();
  }, []);

  // Google Places Autocomplete with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchAddress.trim() && searchAddress.length > 2) {
        try {
          // Call Google Places Autocomplete API
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
              searchAddress,
            )}&key=${GOOGLE_MAPS_API_KEY}`,
          );

          const data = await response.json();

          if (data.status === "OK" && data.predictions) {
            setPlacePredictions(data.predictions);
            setShowAutocomplete(true);
          } else if (data.status === "REQUEST_DENIED") {
            console.error("Google Places API error:", data.error_message);
            Alert.alert("API 錯誤", "請設定您的 Google Maps API 金鑰");
            setPlacePredictions([]);
            setShowAutocomplete(false);
          } else {
            setPlacePredictions([]);
            setShowAutocomplete(false);
          }
        } catch (error) {
          console.error("Autocomplete error:", error);
          setPlacePredictions([]);
          setShowAutocomplete(false);
        }
      } else {
        setPlacePredictions([]);
        setShowAutocomplete(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchAddress]);

  // Get place details from place_id using Google Places Details API
  const getPlaceDetails = async (placeId: string, description: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`,
      );

      const data = await response.json();

      if (data.status === "OK" && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;

        setSearchResult({
          latitude: lat,
          longitude: lng,
          address: description,
        });

        setSearchAddress(description);
        setShowAutocomplete(false);
        setPlacePredictions([]);

        // Animate map to new location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            1000,
          );
        }

        // Update location to trigger venue fetch
        setLocation({
          coords: {
            latitude: lat,
            longitude: lng,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      } else {
        Alert.alert("錯誤", "無法取得地點詳情");
      }
    } catch (error) {
      console.error("Place details error:", error);
      Alert.alert("錯誤", "無法取得地點詳情");
    }
  };

  // Handler for selecting an autocomplete suggestion
  const handleSelectSuggestion = (prediction: PlacePrediction) => {
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  // Function to clear search
  const handleClearSearch = () => {
    setSearchAddress("");
    setSearchResult(null);
    setPlacePredictions([]);
    setShowAutocomplete(false);
  };

  // Function to search for address using Google Geocoding API
  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      Alert.alert("錯誤", "請輸入搜尋地址");
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchAddress,
        )}&key=${GOOGLE_MAPS_API_KEY}`,
      );

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;

        const newSearchResult = {
          latitude: lat,
          longitude: lng,
          address: result.formatted_address,
        };

        setSearchResult(newSearchResult);
        setSearchAddress(result.formatted_address);

        // Animate map to new location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            1000,
          );
        }

        // Update location to trigger venue fetch
        setLocation({
          coords: {
            latitude: lat,
            longitude: lng,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      } else {
        Alert.alert("找不到", "找不到指定地址");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert("錯誤", "搜尋地址失敗，請稍後重試。");
    }
  };

  // Default initial region
  const initialRegion = {
    latitude: location?.coords.latitude || DEFAULT_LAT,
    longitude: location?.coords.longitude || DEFAULT_LNG,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Filter fields based on selected sport type
  // We are now doing server-side filtering, so this client-side filter might be redundant
  // or we can keep it for immediate feedback if we don't want to refetch on every filter change.
  // But the useEffect above refetches on sportType change, so 'venues' should already be filtered.
  const filteredFields = venues;

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
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        customMapStyle={darkMapStyle}
      >
        {/* Current location marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="您的位置"
            description="目前位置"
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
            title="搜尋結果"
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
              <View style={styles.customMarker}>
                <Text style={styles.markerIcon}>📍</Text>
              </View>
            </View>
            <Callout
              onPress={() => router.push(`/field/${field.id}`)}
              style={styles.callout}
            >
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{field.name}</Text>
                {/* <Text style={styles.calloutSportType}>{field.sportType}</Text> */}
                <Text style={styles.calloutDescription} numberOfLines={2}>
                  {field.address}
                </Text>
                <View style={styles.calloutFooter}>
                  <Text style={styles.calloutLink}>點擊查看詳情</Text>
                  <Text style={styles.calloutArrow}>→</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Search input overlay */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchContainer,
            searchFocused && styles.searchContainerFocused,
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={searchFocused ? Colors.gray[400] : Colors.white}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              searchFocused && styles.searchInputFocused,
            ]}
            placeholder="搜尋地點..."
            placeholderTextColor={
              searchFocused ? Colors.gray[400] : Colors.white
            }
            value={searchAddress}
            onChangeText={setSearchAddress}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={searchLocation}
            returnKeyType="search"
          />
          {searchAddress ? (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.gray[400]}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Google Places Autocomplete dropdown */}
      {showAutocomplete && placePredictions.length > 0 && (
        <View style={styles.autocompleteContainer}>
          <ScrollView style={styles.autocompleteScrollView}>
            {placePredictions.map((prediction, index) => (
              <TouchableOpacity
                key={prediction.place_id}
                style={styles.autocompleteSuggestion}
                onPress={() => handleSelectSuggestion(prediction)}
              >
                <Text style={styles.autocompleteSuggestionText}>
                  {prediction.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Sport type filter dropdown */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSportTypeModal(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedSportType === "All"
              ? "依運動類型篩選"
              : SPORT_TYPE_LABELS[selectedSportType] || selectedSportType}
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
            <Text style={styles.modalTitle}>選擇運動類型</Text>
            <ScrollView style={styles.modalScrollView}>
              {SPORT_TYPES.map((sportType) => (
                <TouchableOpacity
                  key={sportType}
                  style={[
                    styles.sportTypeOption,
                    selectedSportType === sportType &&
                    styles.sportTypeOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedSportType(sportType);
                    setShowSportTypeModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sportTypeOptionText,
                      selectedSportType === sportType &&
                      styles.sportTypeOptionTextSelected,
                    ]}
                  >
                    {SPORT_TYPE_LABELS[sportType] || sportType}
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
    backgroundColor: '#fbf5e2ff',
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchSection: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
    zIndex: 1001,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainerFocused: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    padding: 0,
  },
  searchInputFocused: {
    color: Colors.gray[900],
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  autocompleteContainer: {
    position: "absolute",
    top: 118,
    left: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: "#000",
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
    borderBottomColor: Colors.gray[200],
  },
  autocompleteSuggestionText: {
    fontSize: 14,
    color: Colors.gray[900],
  },
  errorText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 16,
    color: Colors.error[500],
    padding: 20,
  },
  filterContainer: {
    position: "absolute",
    top: 110,
    left: 10,
    right: 10,
  },
  filterButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 16,
    color: Colors.gray[900],
    fontWeight: "500",
  },
  filterButtonIcon: {
    fontSize: 12,
    color: Colors.gray[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: Colors.gray[900],
  },
  modalScrollView: {
    maxHeight: 400,
  },
  sportTypeOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sportTypeOptionSelected: {
    backgroundColor: lightenColor(Colors.primary, 80), // Very light primary background
  },
  sportTypeOptionText: {
    fontSize: 16,
    color: Colors.gray[900],
  },
  sportTypeOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "bold",
  },
  customMarker: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: Colors.primary, // Use primary color for marker border
    shadowColor: "#000",
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  calloutSportType: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 6,
  },
  calloutDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 8,
  },
  calloutFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  calloutLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
  },
  calloutArrow: {
    fontSize: 16,
    color: Colors.primary,
  },
});
