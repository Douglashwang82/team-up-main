'use client';

import { useParams } from 'next/navigation';
import { useVenue } from '@/lib/hooks/useVenues';
import Link from 'next/link';

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { venue, isLoading, error } = useVenue(venueId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-600">Loading venue...</div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-800">
          {error?.message || 'Venue not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/venues"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ê Back to Venues
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
      </div>

      {/* Venue Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue Information</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Address</p>
              <p className="text-gray-600">{venue.address}</p>
              {venue.city && <p className="text-gray-500">{venue.city}</p>}
            </div>
          </div>

          {venue.distance_meters !== undefined && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Distance</p>
                <p className="text-gray-600">
                  {venue.distance_meters < 1000
                    ? `${Math.round(venue.distance_meters)} meters`
                    : `${(venue.distance_meters / 1000).toFixed(1)} km`} away
                </p>
              </div>
            </div>
          )}

          {venue.phone && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Phone</p>
                <p className="text-gray-600">{venue.phone}</p>
              </div>
            </div>
          )}

          {venue.email && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-gray-600">{venue.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Courts */}
      {venue.courts && venue.courts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Courts ({venue.courts.length})
          </h2>
          <div className="grid gap-4">
            {venue.courts.map((court: any) => (
              <Link
                key={court.id}
                href={`/venues/${venueId}/courts/${court.id}/timeslots`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{court.name}</h3>
                    {court.sport_type && (
                      <p className="text-sm text-gray-600 mt-1">
                        Sport: <span className="capitalize">{court.sport_type}</span>
                      </p>
                    )}
                    {court.description && (
                      <p className="text-sm text-gray-500 mt-1">{court.description}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!venue.courts || venue.courts.length === 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No courts available at this venue</p>
        </div>
      )}
    </div>
  );
}
