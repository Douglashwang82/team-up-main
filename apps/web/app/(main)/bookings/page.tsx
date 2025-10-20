'use client';

import { useState } from 'react';
import { useBookings } from '@/lib/hooks/useBookings';
import Link from 'next/link';

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { bookings, isLoading, error } = useBookings(statusFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <Link
          href="/venues"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          New Booking
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === undefined
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'confirmed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'cancelled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cancelled
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12 text-gray-600">Loading bookings...</div>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-600">No bookings found</p>
          <Link
            href="/venues"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Find a Venue
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/bookings/${booking.id}`}
            className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Booking #{booking.id.slice(0, 8)}
                  </h2>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
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
                <p className="text-sm text-gray-600">
                  Created {new Date(booking.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.payment_status === 'succeeded'
                        ? 'bg-green-100 text-green-800'
                        : booking.payment_status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : booking.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    Payment: {booking.payment_status}
                  </span>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
