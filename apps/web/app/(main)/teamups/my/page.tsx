'use client';

import { useMyTeamUps } from '@/lib/hooks/useTeamUps';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function MyTeamUpsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { teamups, isLoading, error } = useMyTeamUps();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/teamups/my');
    }
  }, [user, authLoading, router]);

  function getStatusColor(status: string): string {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getProgressPercentage(current: number, max: number): number {
    return Math.min((current / max) * 100, 100);
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/teamups"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ê Back to TeamUps
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My TeamUps</h1>
          <Link
            href="/teamups/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create New TeamUp
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12 text-gray-600">Loading your TeamUps...</div>
      )}

      {!isLoading && teamups.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4">
          <p className="text-gray-600">You haven't created or joined any TeamUps yet.</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/teamups/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Your First TeamUp
            </Link>
            <Link
              href="/teamups"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Browse TeamUps
            </Link>
          </div>
        </div>
      )}

      {/* TeamUps List */}
      <div className="space-y-4">
        {teamups.map((teamup) => {
          const isOwner = teamup.owner_user_id === user.id;

          return (
            <div
              key={teamup.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/teamups/${teamup.id}`}>
                      <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {teamup.title}
                      </h2>
                    </Link>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(teamup.status)}`}>
                      {teamup.status}
                    </span>
                    {isOwner && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Owner
                      </span>
                    )}
                    {teamup.visibility === 'private' && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Private
                      </span>
                    )}
                  </div>

                  {teamup.description && (
                    <p className="text-gray-600 mb-4">{teamup.description}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                    <span>
                      Created {new Date(teamup.created_at).toLocaleDateString()}
                    </span>
                    {teamup.durantion_type === 'recurring' && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Recurring
                      </span>
                    )}
                  </div>

                  {/* Participants Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">
                        Participants: {teamup.current_participants}/{teamup.max_participants}
                      </span>
                      <span className="text-gray-500">
                        {Math.round(getProgressPercentage(teamup.current_participants, teamup.max_participants))}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(teamup.current_participants, teamup.max_participants)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    href={`/teamups/${teamup.id}`}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center transition-colors"
                  >
                    View Details
                  </Link>
                  {isOwner && teamup.status === 'open' && (
                    <Link
                      href={`/teamups/${teamup.id}/manage/requests`}
                      className="px-6 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium text-center transition-colors"
                    >
                      Manage Requests
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
