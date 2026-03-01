import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";

import { Colors } from "../../constants/Colors";
import { apis } from "../../lib/api";
import LiquidSearchBar from "../../components/LiquidSearchBar";
import EventFilterModal, { EventFilterState } from "../../components/EventFilterModal";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

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

// IMPORTANT: Replace with your actual Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyCQpRkPBlpr47iTciS2-3IEjzRD57XCA8I";

const DEFAULT_LAT = 25.013958087753082;
const DEFAULT_LNG = 121.53783024593216;

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

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
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<EventFilterState>({});

  // Map Chinese UI categories to English DB fields
  const CATEGORY_MAP: Record<string, string> = {
    '籃球': 'basketball',
    '羽球': 'badminton',
    '排球': 'volleyball',
    '網球': 'tennis',
    '桌球': 'table_tennis',
    '撞球': 'billiards',
    '游泳': 'swimming',
    '健身': 'fitness'
  };

  // Fetch venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const lat = location?.coords.latitude || DEFAULT_LAT;
        const lng = location?.coords.longitude || DEFAULT_LNG;

        const sportType = activeFilters.category ? CATEGORY_MAP[activeFilters.category] || activeFilters.category : undefined;

        const response = await apis.venues.searchVenues({
          lat: lat,
          lng: lng,
          distance: 10000, // 10km radius
          sportType: sportType,
        });

        // @ts-ignore
        const mappedVenues = response
          .map((item: any) => {
            const v = item.venue || item;
            return {
              id: v.id,
              name: v.name,
              latitude: v.latitude || lat,
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
  }, [location, activeFilters]);

  // Initialize location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  // Google Places Autocomplete with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchAddress.trim() && searchAddress.length > 2) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchAddress)}&key=${GOOGLE_MAPS_API_KEY}`
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
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchAddress]);

  const getPlaceDetails = async (placeId: string, description: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;

        setSearchResult({ latitude: lat, longitude: lng, address: description });
        setSearchAddress(description);
        setShowAutocomplete(false);
        setPlacePredictions([]);

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }, 1000);
        }

        setLocation({
          coords: { latitude: lat, longitude: lng, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
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

  const handleSelectSuggestion = (prediction: PlacePrediction) => {
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  const clearSearch = () => {
    setSearchAddress("");
    setSearchResult(null);
    setPlacePredictions([]);
    setShowAutocomplete(false);
  };

  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      clearSearch();
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;

        setSearchResult({
          latitude: lat,
          longitude: lng,
          address: result.formatted_address,
        });
        setSearchAddress(result.formatted_address);
        setShowAutocomplete(false);

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }, 1000);
        }

        setLocation({
          coords: { latitude: lat, longitude: lng, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
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

  const initialRegion = {
    latitude: location?.coords.latitude || DEFAULT_LAT,
    longitude: location?.coords.longitude || DEFAULT_LNG,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (errorMsg) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="location-outline" size={48} color={Colors.error[500]} />
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false} // We will use a custom overlay instead to match modern design
        showsCompass={true}
        showsScale={false}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="您的位置"
            description="目前位置"
            pinColor={Colors.primary}
          />
        )}

        {searchResult && (
          <Marker
            coordinate={{
              latitude: searchResult.latitude,
              longitude: searchResult.longitude,
            }}
            title="搜尋結果"
            description={searchResult.address}
            pinColor={Colors.tertiary}
          />
        )}

        {venues.map((field) => (
          <Marker
            key={field.id}
            coordinate={{
              latitude: field.latitude,
              longitude: field.longitude,
            }}
          >
            <View style={styles.customMarker}>
              <Ionicons name="location" size={20} color={Colors.white} />
            </View>
            <Callout
              tooltip
              onPress={() => router.push(`/field/${field.id}`)}
            >
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{field.name}</Text>
                <Text style={styles.calloutDescription} numberOfLines={2}>
                  {field.address}
                </Text>
                <View style={styles.calloutFooter}>
                  <Text style={styles.calloutLink}>點擊查看詳情</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Floating Header Actions - Matches index.tsx */}
      <View style={[styles.searchSection, { paddingTop: insets.top + 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LiquidSearchBar
            value={searchAddress}
            onChangeText={(text) => {
              setSearchAddress(text);
              if (!searchFocused) setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            onSubmitEditing={searchLocation}
            onClear={clearSearch}
            onCancel={() => {
              setSearchFocused(false);
              setShowAutocomplete(false);
            }}
            isFocused={searchFocused}
            glassColor="rgba(255, 255, 255, 0.9)"
            placeholder="搜尋地址..."
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filterButtonGlass}>
              {/* Show indicator if any filter is active */}
              {(activeFilters.category || activeFilters.division || activeFilters.datetime_after) && (
                <View style={styles.activeFilterDot} />
              )}
              <Ionicons name="options-outline" size={24} color={Colors.gray[600]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Autocomplete dropdown styled as index.tsx SuggestionsList */}
        {showAutocomplete && placePredictions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" />
            <FlatList
              data={placePredictions}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
              style={styles.suggestionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Ionicons name="location-outline" size={20} color={Colors.gray[500]} />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>{item.description}</Text>
                  </View>
                  <Ionicons name="arrow-up-left-box" size={16} color={Colors.gray[400]} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <EventFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        currentFilters={activeFilters}
        onApply={(filters) => {
          setActiveFilters(filters);
        }}
      />

      {/* Current Location Button Bottom Right */}
      <TouchableOpacity
        style={[styles.myLocationButton, { bottom: insets.bottom + 100 }]}
        onPress={() => {
          if (location && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }, 1000);
          }
        }}
        activeOpacity={0.8}
      >
        <GlassView style={StyleSheet.absoluteFillObject} glassEffectStyle="regular" />
        <Ionicons name="locate" size={24} color={Colors.gray[800]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
    paddingHorizontal: 16,
  },
  filterButton: {
    width: 52,
    height: 52,
  },
  filterButtonGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    // We add a subtle white background so it looks good on a map map
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  activeFilterDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.base,
    zIndex: 2,
  },
  suggestionsContainer: {
    marginTop: 10,
    maxHeight: 250,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 14,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.gray[900],
  },
  customMarker: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  calloutContainer: {
    padding: 16,
    width: 220,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray[900],
    marginBottom: 6,
  },
  calloutDescription: {
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
    marginBottom: 12,
  },
  calloutFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  calloutLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: Colors.gray[600],
    fontWeight: '500',
  }
});
