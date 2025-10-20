'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBooking } from '@/lib/hooks/useBookings';
import { useState } from 'react';

export default function BookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { booking, isLoading, error, updateBooking, cancelBooking } = useBooking(bookingId);
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setCancelling(true);
    try {
      await cancelBooking();
      router.push('/bookings');
    } catch (err) {
      alert('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-12 text-gray-600">Loading booking...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-800">
          {error?.message || 'Booking not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            booking.status === 'confirmed'
              ? 'bg-green-100 text-green-800'
              : booking.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {booking.status}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Venue</h2>
          <p className="text-lg font-semibold text-gray-900">{booking.venue?.name}</p>
          <p className="text-sm text-gray-600">{booking.venue?.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Court</h2>
            <p className="text-gray-900">{booking.court?.name || 'N/A'}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Sport Type</h2>
            <p className="text-gray-900">{booking.court?.sport_type || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Start Time</h2>
            <p className="text-gray-900">
              {new Date(booking.timeslot?.starts_at).toLocaleString()}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">End Time</h2>
            <p className="text-gray-900">
              {new Date(booking.timeslot?.ends_at).toLocaleString()}
            </p>
          </div>
        </div>

        {booking.timeslot?.price_cents && (
          <div>
            <h2 className="text-sm font-medium text-gray-500">Price</h2>
            <p className="text-lg font-semibold text-gray-900">
              {booking.timeslot.currency} {(booking.timeslot.price_cents / 100).toFixed(2)}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-500">Payment Status</h2>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              booking.payment_status === 'succeeded'
                ? 'bg-green-100 text-green-800'
                : booking.payment_status === 'failed'
                ? 'bg-red-100 text-red-800'
                : booking.payment_status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {booking.payment_status}
          </span>
        </div>

        {booking.teamup && (
          <div>
            <h2 className="text-sm font-medium text-gray-500">Team Up</h2>
            <p className="text-gray-900">{booking.teamup.title}</p>
          </div>
        )}
      </div>

      {booking.status === 'pending' || booking.status === 'confirmed' ? (
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      ) : null}

      <div className="text-sm text-gray-500">
        <p>Booking ID: {booking.id}</p>
        <p>Created: {new Date(booking.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
