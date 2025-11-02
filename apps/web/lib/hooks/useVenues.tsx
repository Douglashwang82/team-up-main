'use client';

import { useState, useEffect } from 'react';
import { apis } from '../api';
import { SearchVenuesRequest, TimeslotOut, VenueDetail, VenueOut, VenueSearchResult } from '@team-up-main/api-client';

export function useVenuesWithTimeslots(params?: SearchVenuesRequest) {
  const [venues, setVenues] = useState<VenueSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!params) {
      setVenues([]);
      setIsLoading(false);
      return;
    }

    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const venueSearchResult: VenueSearchResult[] = await apis.venues.searchVenues({
          lat: params?.lat,
          lng: params?.lng,
          distance: params?.distance,
          datetime: params?.datetime,
          sportType: params?.sportType,
        });

        setVenues(venueSearchResult);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, [params?.lat, params?.lng, params?.distance, params?.datetime, params?.sportType]);

  return { venues, isLoading, error };
}

export function useVenue(venueId: string) {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
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
  const [timeslots, setTimeslots] = useState<TimeslotOut[]>([]);
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
