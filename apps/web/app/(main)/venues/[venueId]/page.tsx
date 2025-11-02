'use client';

import { useParams } from 'next/navigation';
import { useVenue } from '@/lib/hooks/useVenues';
import Link from 'next/link';

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { venue, isLoading, error } = useVenue(venueId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
          <svg className="mx-auto h-16 w-16 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-6">{error?.message || 'This venue does not exist or has been removed.'}</p>
          <Link href="/venues" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
            Browse Venues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/venues"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Venues
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              {venue.courts && (
                <p className="text-lg text-gray-600">
                  {venue.courts.length} {venue.courts.length === 1 ? 'Court' : 'Courts'} Available
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Venue Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact & Location */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Venue Information</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Address</p>
                    <p className="text-gray-700">{venue.address}</p>
                    {venue.city && <p className="text-gray-600 text-sm mt-1">{venue.city}</p>}
                  </div>
                </div>

                {venue.distance_meters !== undefined && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Distance</p>
                      <p className="text-gray-700">
                        {venue.distance_meters < 1000
                          ? `${Math.round(venue.distance_meters)} meters`
                          : `${(venue.distance_meters / 1000).toFixed(1)} km`} away from you
                      </p>
                    </div>
                  </div>
                )}

                {venue.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Phone</p>
                      <a href={`tel:${venue.phone}`} className="text-blue-600 hover:text-blue-700">
                        {venue.phone}
                      </a>
                    </div>
                  </div>
                )}

                {venue.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Email</p>
                      <a href={`mailto:${venue.email}`} className="text-blue-600 hover:text-blue-700">
                        {venue.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Courts */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Available Courts {venue.courts && `(${venue.courts.length})`}
              </h2>

              {venue.courts && venue.courts.length > 0 ? (
                <div className="grid gap-4">
                  {venue.courts.map((court: any) => (
                    <Link
                      key={court.id}
                      href={`/venues/${venueId}/courts/${court.id}/timeslots`}
                      className="group p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-2 transition-colors">
                            {court.name}
                          </h3>
                          {court.sportType && (
                            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                                {court.sportType}
                              </span>
                            </p>
                          )}
                          {court.description && (
                            <p className="text-sm text-gray-600">{court.description}</p>
                          )}
                        </div>
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 font-medium">No courts available</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Ready to Book?</h3>
              <p className="text-gray-700 text-sm mb-4">
                Select a court to view available time slots and make a reservation.
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Instant confirmation</span>
              </div>
            </div>

            {venue.courts && venue.courts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Courts</span>
                    <span className="font-semibold text-gray-900">{venue.courts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sports Available</span>
                    <span className="font-semibold text-gray-900">
                      {new Set(venue.courts.map((c: any) => c.sportType).filter(Boolean)).size || 1}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
