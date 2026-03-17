import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { apis } from '../../../lib/api';

const DEFAULT_LAT = 25.013958087753082;
const DEFAULT_LNG = 121.53783024593216;

export default function MapWidget() {
    const { colors } = useTheme();
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const navColors = colors as any;

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [venues, setVenues] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();

                let currentLoc = {
                    coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG }
                } as Location.LocationObject;

                if (status === 'granted') {
                    currentLoc = await Location.getCurrentPositionAsync({});
                }
                setLocation(currentLoc);

                const response = await apis.venues.searchVenues({
                    lat: currentLoc.coords.latitude,
                    lng: currentLoc.coords.longitude,
                    distance: 10000,
                    requireBookable: false,
                });

                // @ts-ignore
                const mappedVenues = response.map((item: any) => {
                    const v = item.venue || item;
                    return {
                        id: v.id,
                        name: v.name,
                        latitude: Number(v.latitude),
                        longitude: Number(v.longitude),
                    };
                }).filter((v: any) => !isNaN(v.latitude) && !isNaN(v.longitude));

                setVenues(mappedVenues);
            } catch (error) {
                console.error("Widget Map Error:", error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const initialRegion = {
        latitude: location?.coords.latitude || DEFAULT_LAT,
        longitude: location?.coords.longitude || DEFAULT_LNG,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Ionicons name="map" size={18} color={navColors.activeIcon || '#F97316'} />
                <Text style={[styles.title, { color: colors.text }]}>活動地圖</Text>
            </View>

            <View style={styles.mapContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : (
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={initialRegion}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        showsCompass={false}
                        pitchEnabled={false}
                        scrollEnabled={true}
                    >
                        {venues.map((venue) => (
                            <Marker
                                key={venue.id}
                                coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
                                onPress={() => router.push(`/venue/${venue.id}`)}
                            >
                                <View style={styles.customMarker}>
                                    <View style={styles.markerInner} />
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                )}
            </View>
            <TouchableOpacity
                style={[styles.footerButton, { borderTopColor: colors.border }]}
                onPress={() => router.push('/map')}
            >
                <Text style={[styles.footerText, { color: navColors.textSecondary }]}>在地圖上探索更多場地</Text>
                <Ionicons name="chevron-forward" size={16} color={navColors.textSecondary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
    },
    mapContainer: {
        height: 220,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    markerInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#F97316',
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    footerText: {
        fontSize: 13,
    }
});
