import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

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

  // Default initial region (San Francisco)
  const initialRegion = {
    latitude: location?.coords.latitude || 37.78825,
    longitude: location?.coords.longitude || -122.4324,
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
        provider={PROVIDER_GOOGLE}
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
  errorText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: 'red',
    padding: 20,
  },
});
