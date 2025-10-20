'use client';

import { useState, useEffect } from 'react';

interface Booking {
  id: string;
  owner_user_id: string;
  timeslot_id: string;
  teamup_id?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'none' | 'pending' | 'succeeded' | 'failed';
  created_at: string;
  updated_at: string;
}

interface BookingDetail extends Booking {
  timeslot: any;
  court: any;
  venue: any;
  teamup?: any;
}

export function useBookings(status?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('Not authenticated');
        }

        const searchParams = new URLSearchParams();
        if (status) searchParams.set('status', status);

        const url = `${process.env.NEXT_PUBLIC_API_URL}/bookings?${searchParams}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [status]);

  return { bookings, isLoading, error, refetch: () => {} };
}

export function useBooking(bookingId: string) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch booking: ${response.statusText}`);
        }

        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const updateBooking = async (updates: { status?: string; payment_status?: string }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update booking: ${response.statusText}`);
      }

      const data = await response.json();
      setBooking(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const cancelBooking = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel booking: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  return { booking, isLoading, error, updateBooking, cancelBooking };
}

export async function createBooking(timeslotId: string, teamupId?: string) {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ timeslot_id: timeslotId, teamup_id: teamupId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
}
