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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading join requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
          <svg className="mx-auto h-16 w-16 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Requests</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/teamups/${teamupId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to TeamUp
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Manage Join Requests</h1>
              <p className="text-lg text-gray-600 mt-1">
                Review and respond to requests from interested players
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-700 mb-1">Pending</p>
                <p className="text-4xl font-bold text-yellow-900">{pendingRequests.length}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Reviewed</p>
                <p className="text-4xl font-bold text-blue-900">{reviewedRequests.length}</p>
              </div>
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Pending Requests
            </h2>
            {pendingRequests.length > 0 && (
              <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold border border-yellow-200">
                {pendingRequests.length} awaiting review
              </span>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No pending join requests</p>
              <p className="text-sm text-gray-400 mt-1">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-white font-bold text-xl">
                        {request.userId.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        User {request.userId.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(request.id, 'approve')}
                      disabled={processing === request.id}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      {processing === request.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleReview(request.id, 'reject')}
                      disabled={processing === request.id}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Reviewed Requests
            </h2>

            <div className="space-y-3">
              {reviewedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {request.userId.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        User {request.userId.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {request.status === 'approved' ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rejected
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Join Requests Yet</h3>
            <p className="text-gray-600">
              When users request to join your TeamUp, they will appear here for review
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
