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
      router.push(`/login?redirect=/teamups/${teamupId}`);
      return;
    }

    setJoining(true);
    try {
      await createJoinRequest(teamupId);
      alert('Join request sent successfully!');
      window.location.reload(); // Refresh to show updated state
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-600">Loading TeamUp...</div>
      </div>
    );
  }

  if (error || !teamup) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-800">
          {error?.message || 'TeamUp not found'}
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/teamups"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ê Back to TeamUps
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{teamup.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(teamup.status)}`}>
                {teamup.status}
              </span>
              {teamup.visibility === 'private' && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  Private
                </span>
              )}
              {isOwner && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Owner
                </span>
              )}
            </div>
            <p className="text-gray-600">
              Created {new Date(teamup.created_at).toLocaleDateString()} " {teamup.durantion_type === 'recurring' ? 'Recurring' : 'Temporary'}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/teamups/${teamupId}/manage/requests`}
                className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors"
              >
                Manage Requests
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {teamup.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700">{teamup.description}</p>
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Max Participants</p>
            <p className="text-lg font-semibold text-gray-900">{teamup.max_participants}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Participants</p>
            <p className="text-lg font-semibold text-gray-900">{teamup.current_participants}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Visibility</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{teamup.visibility}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{teamup.durantion_type}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Capacity
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((teamup.current_participants / teamup.max_participants) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${Math.min((teamup.current_participants / teamup.max_participants) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Participants ({teamup.participants?.length || 0})
        </h2>
        {teamup.participants && teamup.participants.length > 0 ? (
          <div className="space-y-3">
            {teamup.participants.map((participant) => (
              <div
                key={participant.user_id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {participant.user_id.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">User {participant.user_id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(participant.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {participant.role === 'owner' && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Owner
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    participant.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {participant.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No participants yet</p>
        )}
      </div>

      {/* Bookings */}
      {teamup.bookings && teamup.bookings.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bookings ({teamup.bookings.length})
          </h2>
          <div className="space-y-3">
            {teamup.bookings.map((booking: any) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Booking #{booking.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {booking.status} " {booking.payment_status}
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

      {/* Actions */}
      {!isOwner && user && teamup.status === 'open' && !isParticipant && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Interested in joining?</h3>
          <p className="text-gray-600 mb-4">
            Send a join request to the organizer to become a participant.
          </p>
          <button
            onClick={handleJoinRequest}
            disabled={joining || teamup.current_participants >= teamup.max_participants}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {joining ? 'Sending Request...' : teamup.current_participants >= teamup.max_participants ? 'TeamUp Full' : 'Send Join Request'}
          </button>
        </div>
      )}

      {!user && teamup.status === 'open' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">Sign in to join this TeamUp</p>
          <Link
            href={`/login?redirect=/teamups/${teamupId}`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Owner Controls */}
      {isOwner && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner Controls</h2>
          <div className="flex gap-3">
            {teamup.status !== 'open' && (
              <button
                onClick={() => handleStatusChange('open')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Reopen TeamUp
              </button>
            )}
            {teamup.status === 'open' && (
              <button
                onClick={() => handleStatusChange('closed')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close TeamUp
              </button>
            )}
            {teamup.status !== 'cancelled' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel TeamUp
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
