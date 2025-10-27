'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTeamUp } from '@/lib/hooks/useTeamUps';
import { useAuth } from '@/lib/hooks/useAuth';
import { createJoinRequest } from '@/lib/hooks/useTeamUps';
import { useState } from 'react';
import Link from 'next/link';

export default function TeamUpDetailPage() {
  const { teamupId } = useParams<{ teamupId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { teamup, isLoading, error, updateTeamUp, deleteTeamUp } = useTeamUp(teamupId);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user && teamup && teamup.owner_user_id === user.id;
  const isParticipant = teamup?.participants?.some(p => p.user_id === user?.id);

  async function handleJoinRequest() {
    if (!user) {
      alert('You must be signed in to join this TeamUp');
      return;
    }

    setJoining(true);
    try {
      await createJoinRequest(teamupId);
      alert('Join request sent successfully!');
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || 'Failed to send join request');
    } finally {
      setJoining(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this TeamUp? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteTeamUp();
      router.push('/teamups');
    } catch (err) {
      alert('Failed to delete TeamUp');
      setDeleting(false);
    }
  }

  async function handleStatusChange(newStatus: 'open' | 'closed' | 'cancelled') {
    try {
      await updateTeamUp({ status: newStatus });
    } catch (err) {
      alert('Failed to update status');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading TeamUp...</p>
        </div>
      </div>
    );
  }

  if (error || !teamup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
          <svg className="mx-auto h-16 w-16 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">TeamUp Not Found</h2>
          <p className="text-gray-600 mb-6">{error?.message || 'This TeamUp does not exist or has been removed.'}</p>
          <Link href="/teamups" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
            Browse TeamUps
          </Link>
        </div>
      </div>
    );
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  const progress = Math.min((teamup.current_participants / teamup.max_participants) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/teamups"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to TeamUps
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-gray-900">{teamup.title}</h1>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(teamup.status)}`}>
                  {teamup.status.toUpperCase()}
                </span>
                {teamup.visibility === 'private' && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Private
                  </span>
                )}
                {isOwner && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Owner
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(teamup.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  {teamup.durantion_type === 'recurring' ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Recurring
                    </>
                  ) : (
                    'One-time'
                  )}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/teamups/${teamupId}/manage/requests`}
                  className="inline-flex items-center px-5 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Requests
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {teamup.description && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This TeamUp</h2>
                <p className="text-gray-700 leading-relaxed">{teamup.description}</p>
              </div>
            )}

            {/* Participants */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Participants ({teamup.participants?.length || 0})
              </h2>
              {teamup.participants && teamup.participants.length > 0 ? (
                <div className="space-y-3">
                  {teamup.participants.map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {participant.user_id.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">User {participant.user_id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            Joined {new Date(participant.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.role === 'owner' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Owner
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          participant.status === 'active'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {participant.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No participants yet</p>
              )}
            </div>

            {/* Bookings */}
            {teamup.bookings && teamup.bookings.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Bookings ({teamup.bookings.length})
                </h2>
                <div className="space-y-3">
                  {teamup.bookings.map((booking: any) => (
                    <Link
                      key={booking.id}
                      href={`/bookings/${booking.id}`}
                      className="block p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">Booking #{booking.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {booking.status} • {booking.payment_status}
                          </p>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Capacity</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {teamup.current_participants}/{teamup.max_participants}
                    </p>
                    <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-yellow-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Visibility</p>
                    <p className="font-semibold text-gray-900 capitalize">{teamup.visibility}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{teamup.durantion_type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Action */}
            {!isOwner && user && teamup.status === 'open' && !isParticipant && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">Ready to Join?</h3>
                <p className="text-gray-700 text-sm mb-4">
                  Send a join request to become a participant.
                </p>
                <button
                  onClick={handleJoinRequest}
                  disabled={joining || teamup.current_participants >= teamup.max_participants}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  {joining ? 'Sending...' : teamup.current_participants >= teamup.max_participants ? 'TeamUp Full' : 'Send Join Request'}
                </button>
              </div>
            )}

            {!user && teamup.status === 'open' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
                <p className="text-gray-700 mb-4">Sign in to join this TeamUp</p>
                <Link
                  href={`/login?redirect=/teamups/${teamupId}`}
                  className="inline-block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Owner Controls */}
            {isOwner && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Owner Controls</h2>
                <div className="space-y-3">
                  {teamup.status !== 'open' && (
                    <button
                      onClick={() => handleStatusChange('open')}
                      className="w-full px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Reopen TeamUp
                    </button>
                  )}
                  {teamup.status === 'open' && (
                    <button
                      onClick={() => handleStatusChange('closed')}
                      className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Close TeamUp
                    </button>
                  )}
                  {teamup.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange('cancelled')}
                      className="w-full px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Cancel TeamUp
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
