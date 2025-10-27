'use client';

import { useState } from 'react';
import { useTeamUps } from '@/lib/hooks/useTeamUps';
import Link from 'next/link';
import { SearchTeamUpsRequest } from '@team-up-main/api-client';

export default function TeamUpsPage() {
  const [keyword, setKeyword] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [searchParams, setSearchParams] = useState<SearchTeamUpsRequest | null>(null);

  const { teamups, isLoading, error } = useTeamUps(searchParams ?? undefined);

  function getStatusColor(status: string): string {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  function getProgressPercentage(current: number, max: number): number {
    return Math.min((current / max) * 100, 100);
  }

  function getProgressColor(percentage: number): string {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-600';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover TeamUps</h1>
              <p className="text-lg text-gray-600">Find and join local sports activities</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/teamups/my"
                className="inline-flex items-center px-5 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My TeamUps
              </Link>
              <Link
                href="/teamups/new"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create TeamUp
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={keyword || ''}
                placeholder='e.g., "basketball", "morning run"'
                onChange={(e) => setKeyword(e.target.value || '')}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {/* Submit Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (keyword.trim() === '') return; // Do not submit if keyword is empty
                  setSearchParams({ keyword, limit, offset });
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                Search
              </button>
            </div>

            {/* Clear Filters */}
            {/* {(statusFilter || titleFilter) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter(undefined);
                    setTitleFilter(undefined);
                  }}
                  className="px-5 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )} */}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 flex-1">{error.message}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading TeamUps...</p>
          </div>
        )}

        {!isLoading && teamups.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No TeamUps Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or create the first one!</p>
            <Link
              href="/teamups/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First TeamUp
            </Link>
          </div>
        )}

        {/* TeamUps Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamups.map((teamup) => {
            const progress = getProgressPercentage(teamup.current_participants, teamup.max_participants);
            return (
              <Link
                key={teamup.id}
                href={`/teamups/${teamup.id}`}
                className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(teamup.status)}`}>
                      {teamup.status.toUpperCase()}
                    </span>
                    {teamup.visibility === 'private' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Private
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {teamup.title}
                  </h3>

                  {/* Description */}
                  {teamup.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {teamup.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(teamup.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Participants Progress */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-semibold text-gray-700">
                        {teamup.current_participants}/{teamup.max_participants} Participants
                      </span>
                      <span className="text-gray-500 font-medium">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {progress >= 90 && (
                      <p className="text-xs text-red-600 font-medium mt-2">Almost full!</p>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 group-hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                      {teamup.status === 'open' ? 'View & Join' : 'View Details'}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
