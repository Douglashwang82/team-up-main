'use client';

import { useState, useEffect } from 'react';

interface VenueSearchParams {
  lat?: number;
  lng?: number;
  distance?: number;
  datetime?: string;
  sport_type?: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city?: string;
  distance_meters?: number;
}

interface Timeslot {
  id: string;
  court_id: string;
  court_name?: string;
  sport_type?: string;
  starts_at: string;
  ends_at: string;
  price_cents?: number;
  currency: string;
  is_bookable: boolean;
}

interface VenueSearchResult {
  venue: Venue;
  timeslots: Timeslot[];
}

export function useVenues(params?: VenueSearchParams) {
  const [venues, setVenues] = useState<VenueSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        if (params?.lat) searchParams.set('lat', params.lat.toString());
        if (params?.lng) searchParams.set('lng', params.lng.toString());
        if (params?.distance) searchParams.set('distance', params.distance.toString());
        if (params?.datetime) searchParams.set('datetime', params.datetime);
        if (params?.sport_type) searchParams.set('sport_type', params.sport_type);

        const url = `${process.env.NEXT_PUBLIC_API_URL}/venues?${searchParams}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch venues: ${response.statusText}`);
        }

        const data = await response.json();
        setVenues(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, [params?.lat, params?.lng, params?.distance, params?.datetime, params?.sport_type]);

  return { venues, isLoading, error };
}

export function useVenue(venueId: string) {
  const [venue, setVenue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVenue = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${venueId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch venue: ${response.statusText}`);
        }

        const data = await response.json();
        setVenue(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    if (venueId) {
      fetchVenue();
    }
  }, [venueId]);

  return { venue, isLoading, error };
}

export function useCourtTimeslots(venueId: string, courtId: string, date?: string) {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTimeslots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        if (date) searchParams.set('date', date);

        const url = `${process.env.NEXT_PUBLIC_API_URL}/venues/${venueId}/courts/${courtId}/timeslots?${searchParams}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch timeslots: ${response.statusText}`);
        }

        const data = await response.json();
        setTimeslots(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    if (venueId && courtId) {
      fetchTimeslots();
    }
  }, [venueId, courtId, date]);

  return { timeslots, isLoading, error };
}
