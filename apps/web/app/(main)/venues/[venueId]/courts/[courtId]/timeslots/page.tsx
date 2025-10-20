'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCourtTimeslots } from '@/lib/hooks/useVenues';
import { createBooking } from '@/lib/hooks/useBookings';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import Link from 'next/link';

export default function CourtTimeslotsPage() {
  const { venueId, courtId } = useParams<{ venueId: string; courtId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { timeslots, isLoading, error } = useCourtTimeslots(venueId, courtId, selectedDate);
  const [booking, setBooking] = useState<string | null>(null);

  async function handleBooking(timeslotId: string) {
    if (!user) {
      router.push(`/login?redirect=/venues/${venueId}/courts/${courtId}/timeslots`);
      return;
    }

    setBooking(timeslotId);
    try {
      const newBooking = await createBooking(timeslotId);
      router.push(`/bookings/${newBooking.id}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to create booking');
      setBooking(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/venues/${venueId}`}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ê Back to Venue
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Court Timeslots</h1>
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12 text-gray-600">Loading timeslots...</div>
      )}

      {!isLoading && timeslots.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No timeslots available for this date</p>
          <p className="text-sm text-gray-500 mt-2">Try selecting a different date</p>
        </div>
      )}

      {/* Timeslots List */}
      <div className="space-y-3">
        {timeslots.map((timeslot) => {
          const startTime = new Date(timeslot.starts_at);
          const endTime = new Date(timeslot.ends_at);
          const isBookable = timeslot.is_bookable;
          const isBooking = booking === timeslot.id;

          return (
            <div
              key={timeslot.id}
              className={`bg-white rounded-lg border p-4 transition-all ${
                isBookable
                  ? 'border-gray-200 hover:border-blue-500 hover:shadow-md'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </h3>
                    {!isBookable && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">
                        Not Available
                      </span>
                    )}
                    {timeslot.court_name && (
                      <span className="text-sm text-gray-600">
                        {timeslot.court_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {timeslot.sport_type && (
                      <span className="capitalize">
                        Sport: {timeslot.sport_type}
                      </span>
                    )}
                    {timeslot.price_cents !== undefined && (
                      <span className="font-semibold text-gray-900">
                        {timeslot.currency} {(timeslot.price_cents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {isBookable && (
                  <button
                    onClick={() => handleBooking(timeslot.id)}
                    disabled={isBooking}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isBooking ? 'Booking...' : 'Book Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!user && timeslots.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">Sign in to book a timeslot</p>
          <Link
            href={`/login?redirect=/venues/${venueId}/courts/${courtId}/timeslots`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
