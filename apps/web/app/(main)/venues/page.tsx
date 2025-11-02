'use client';

import { useState } from 'react';
import Link from 'next/link';

// TODO: Replace with actual API hook when available
function useVenues() {
  return {
    venues: [],
    isLoading: false,
    error: null
  };
}

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const { venues, isLoading, error } = useVenues();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Venues</h1>
          <p className="text-lg text-gray-600">Discover sports facilities and book courts near you</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Venues
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, location, or sport..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sport Type
              </label>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Sports</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="badminton">Badminton</option>
                <option value="soccer">Soccer</option>
                <option value="volleyball">Volleyball</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 flex-1">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading venues...</p>
          </div>
        )}

        {!isLoading && venues.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Venues Found</h3>
            <p className="text-gray-600 mb-6">
              We're working on adding more venues. Check back soon!
            </p>
          </div>
        )}

        {/* Venues Grid - Placeholder for when data is available */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue: any) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Venue Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {venue.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{venue.address}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {venue.courts_count} courts
                  </span>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
