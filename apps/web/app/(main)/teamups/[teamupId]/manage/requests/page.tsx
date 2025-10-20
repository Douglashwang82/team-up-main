'use client';

import { useParams, useRouter } from 'next/navigation';
import { useJoinRequests, reviewJoinRequest } from '@/lib/hooks/useTeamUps';
import { useState } from 'react';
import Link from 'next/link';

export default function JoinRequestsPage() {
  const { teamupId } = useParams<{ teamupId: string }>();
  const router = useRouter();
  const { requests, isLoading, error, refetch } = useJoinRequests(teamupId);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleReview(requestId: string, action: 'approve' | 'reject') {
    setProcessing(requestId);
    try {
      await reviewJoinRequest(teamupId, requestId, action);
      await refetch();
    } catch (err: any) {
      alert(err?.message || `Failed to ${action} request`);
    } finally {
      setProcessing(null);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-600">Loading join requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-800">
          {error.message}
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/teamups/${teamupId}`}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ê Back to TeamUp
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Manage Join Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and respond to join requests for your TeamUp
        </p>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending join requests</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-lg">
                      {request.user_id.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      User {request.user_id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Requested {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(request.id, 'approve')}
                    disabled={processing === request.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {processing === request.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReview(request.id, 'reject')}
                    disabled={processing === request.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {processing === request.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed Requests */}
      {reviewedRequests.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reviewed Requests ({reviewedRequests.length})
          </h2>

          <div className="space-y-3">
            {reviewedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {request.user_id.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      User {request.user_id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Requested {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No join requests yet</p>
          <p className="text-sm text-gray-400 mt-2">
            When users request to join your TeamUp, they will appear here
          </p>
        </div>
      )}
    </div>
  );
}
