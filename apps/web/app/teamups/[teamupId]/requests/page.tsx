'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apis } from '@/lib/api';

// Types based on PRD specifications
interface JoinRequest {
  id: string;
  teamup_id: string;
  applicant_user_id?: string;
  applicant_name: string;
  applicant_email?: string;
  applicant_phone?: string;
  message?: string;
  status: 'submitted' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
}

interface TeamUpBasicInfo {
  id: string;
  title: string;
  owner_user_id: string;
  current_participants: number;
  max_participants: number;
  status: string;
}

export default function TeamUpRequestsPage() {
  const { teamupId } = useParams<{ teamupId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [teamup, setTeamup] = useState<TeamUpBasicInfo | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, [teamupId]);

  async function checkAuthAndFetch() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login to manage requests');
      router.push('/login');
      return;
    }

    try {
      const userData = await apis.auth.getMe();
      setUser(userData);
      await fetchTeamUpAndRequests(userData.id);
    } catch (err) {
      alert('Authentication failed. Please login again.');
      router.push('/login');
    }
  }

  async function fetchTeamUpAndRequests(userId: string) {
    setLoading(true);
    setError(null);
    try {
      // Fetch teamup details
      const teamupData = await apis.teamups.getTeamUpById({ id: teamupId });
      setTeamup(teamupData);

      // Check if user is the owner
      if (teamupData.owner_user_id !== userId) {
        alert('You are not authorized to manage requests for this teamup');
        router.push(`/teamups/${teamupId}`);
        return;
      }

      // Fetch join requests
      const requestsData = await apis.teamups.getTeamUpJoinRequests({ id: teamupId });
      setRequests(requestsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load join requests');
      console.error('Error fetching join requests:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewRequest(requestId: string, approved: boolean) {
    if (processing) return;

    const action = approved ? 'approve' : 'reject';
    const confirmMsg = approved
      ? 'Are you sure you want to approve this request?'
      : 'Are you sure you want to reject this request?';

    if (!confirm(confirmMsg)) return;

    setProcessing(requestId);
    try {
      await apis.teamups.reviewJoinRequest({
        id: teamupId,
        requestId: requestId,
        reviewJoinRequestRequest: {
          approved: approved
        }
      });

      alert(`Request ${approved ? 'approved' : 'rejected'} successfully!`);

      // Refresh data
      if (user) {
        await fetchTeamUpAndRequests(user.id);
      }
    } catch (err: any) {
      alert(err?.message || `Failed to ${action} request`);
      console.error(`Error ${action}ing request:`, err);
    } finally {
      setProcessing(null);
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'submitted':
        return '#f59e0b'; // amber
      case 'approved':
        return '#10b981'; // green
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'submitted':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading join requests...</div>;
  }

  if (error || !teamup) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'crimson' }}>{error || 'TeamUp not found'}</p>
        <button
          className="btn"
          onClick={() => router.push(`/teamups/${teamupId}`)}
          style={{ marginTop: '1rem' }}
        >
          Back to TeamUp
        </button>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'submitted');
  const reviewedRequests = requests.filter(r => r.status !== 'submitted');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push(`/teamups/${teamupId}`)}
          style={{ marginBottom: '1rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          ← Back to TeamUp
        </button>

        <h1>Manage Join Requests</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          TeamUp: <strong>{teamup.title}</strong>
        </p>
        <p className="small" style={{ color: '#6b7280' }}>
          Current participants: {teamup.current_participants}/{teamup.max_participants}
        </p>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '2rem', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Total Requests</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{requests.length}</div>
          </div>
          <div>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Pending</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b' }}>{pendingRequests.length}</div>
          </div>
          <div>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Reviewed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#6b7280' }}>{reviewedRequests.length}</div>
          </div>
        </div>
      </div>

      {/* At Capacity Warning */}
      {teamup.current_participants >= teamup.max_participants && (
        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #fbbf24' }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            <strong>Note:</strong> This teamup has reached maximum capacity. You cannot approve more requests unless participants leave.
          </p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card" style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            No join requests yet. Share your teamup to get participants!
          </p>
        </div>
      ) : (
        <>
          {/* Pending Requests Section */}
          {pendingRequests.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                Pending Requests ({pendingRequests.length})
              </h2>

              <div>
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        {/* Applicant Info */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                            {request.applicant_name}
                          </div>
                          {request.applicant_email && (
                            <div className="small" style={{ color: '#6b7280' }}>
                              Email: {request.applicant_email}
                            </div>
                          )}
                          {request.applicant_phone && (
                            <div className="small" style={{ color: '#6b7280' }}>
                              Phone: {request.applicant_phone}
                            </div>
                          )}
                        </div>

                        {/* Message */}
                        {request.message && (
                          <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                            <div className="small" style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Message:</div>
                            <div className="small" style={{ color: '#374151' }}>{request.message}</div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="small" style={{ color: '#6b7280' }}>
                          Applied: {new Date(request.created_at).toLocaleString()}
                          {request.applicant_user_id && ' • Registered User'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleReviewRequest(request.id, true)}
                          disabled={processing === request.id || teamup.current_participants >= teamup.max_participants}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: processing === request.id || teamup.current_participants >= teamup.max_participants ? 'not-allowed' : 'pointer',
                            opacity: processing === request.id || teamup.current_participants >= teamup.max_participants ? 0.6 : 1,
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {processing === request.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReviewRequest(request.id, false)}
                          disabled={processing === request.id}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: processing === request.id ? 'not-allowed' : 'pointer',
                            opacity: processing === request.id ? 0.6 : 1,
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {processing === request.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed Requests Section */}
          {reviewedRequests.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                Reviewed Requests ({reviewedRequests.length})
              </h2>

              <div>
                {reviewedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      backgroundColor: '#f9fafb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        {/* Applicant Info */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                              {request.applicant_name}
                            </div>
                            <span
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                backgroundColor: getStatusColor(request.status),
                                color: 'white'
                              }}
                            >
                              {getStatusLabel(request.status)}
                            </span>
                          </div>
                          {request.applicant_email && (
                            <div className="small" style={{ color: '#6b7280' }}>
                              Email: {request.applicant_email}
                            </div>
                          )}
                          {request.applicant_phone && (
                            <div className="small" style={{ color: '#6b7280' }}>
                              Phone: {request.applicant_phone}
                            </div>
                          )}
                        </div>

                        {/* Message */}
                        {request.message && (
                          <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px' }}>
                            <div className="small" style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Message:</div>
                            <div className="small" style={{ color: '#374151' }}>{request.message}</div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="small" style={{ color: '#6b7280' }}>
                          Applied: {new Date(request.created_at).toLocaleString()}
                          {request.reviewed_at && ` • Reviewed: ${new Date(request.reviewed_at).toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={() => router.push(`/teamups/${teamupId}`)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Back to TeamUp Details
        </button>
      </div>
    </div>
  );
}
