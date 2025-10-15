'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apis } from '@/lib/api';

// Types based on PRD specifications
interface TeamUpOut {
  id: string;
  title: string;
  description?: string;
  owner_user_id: string;
  min_participants: number;
  max_participants: number;
  current_participants: number;
  deadline?: string;
  sport_type?: string;
  status: 'open' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  court_timeslot?: {
    id: string;
    starts_at: string;
    ends_at: string;
    venue?: {
      name: string;
      city: string;
      address: string;
    };
  };
}

type TabType = 'created' | 'joined';

export default function MyTeamUpsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('created');
  const [createdTeamUps, setCreatedTeamUps] = useState<TeamUpOut[]>([]);
  const [joinedTeamUps, setJoinedTeamUps] = useState<TeamUpOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  async function checkAuthAndFetch() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login to view your teamups');
      router.push('/login');
      return;
    }

    try {
      const userData = await apis.auth.getMe();
      setUser(userData);
      await fetchMyTeamUps(userData.id);
    } catch (err) {
      alert('Authentication failed. Please login again.');
      router.push('/login');
    }
  }

  async function fetchMyTeamUps(userId: string) {
    setLoading(true);
    setError(null);
    try {
      // Fetch teamups created by user
      const created = await apis.teamups.getMyCreatedTeamUps();
      setCreatedTeamUps(created);

      // Fetch teamups joined by user
      const joined = await apis.teamups.getMyJoinedTeamUps();
      setJoinedTeamUps(joined);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your teamups');
      console.error('Error fetching my teamups:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'open':
        return '#10b981';
      case 'confirmed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  function getProgressPercentage(current: number, max: number): number {
    return Math.min((current / max) * 100, 100);
  }

  function renderTeamUpCard(teamup: TeamUpOut, isOwner: boolean) {
    return (
      <div key={teamup.id} className="card" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{teamup.title}</h3>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: getStatusColor(teamup.status),
                  color: 'white'
                }}
              >
                {teamup.status}
              </span>
              {isOwner && (
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: '#f59e0b',
                    color: 'white'
                  }}
                >
                  Owner
                </span>
              )}
            </div>

            {/* Description */}
            {teamup.description && (
              <p className="small" style={{ margin: '0.5rem 0', color: '#6b7280' }}>
                {teamup.description}
              </p>
            )}

            {/* Details */}
            <div className="small" style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {teamup.sport_type && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <strong>Sport:</strong> {teamup.sport_type}
                </span>
              )}
              {teamup.court_timeslot?.venue && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <strong>Venue:</strong> {teamup.court_timeslot.venue.name}
                </span>
              )}
              {teamup.court_timeslot?.venue?.city && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <strong>City:</strong> {teamup.court_timeslot.venue.city}
                </span>
              )}
            </div>

            {/* Timeslot */}
            {teamup.court_timeslot && (
              <div className="small" style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                <strong>Time:</strong> {new Date(teamup.court_timeslot.starts_at).toLocaleString()} - {new Date(teamup.court_timeslot.ends_at).toLocaleTimeString()}
              </div>
            )}

            {/* Participants Progress Bar */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span className="small" style={{ fontWeight: 500 }}>
                  Participants: {teamup.current_participants}/{teamup.max_participants}
                </span>
                <span className="small" style={{ color: '#6b7280' }}>
                  Min: {teamup.min_participants}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: teamup.current_participants >= teamup.min_participants ? '#10b981' : '#f59e0b',
                    width: `${getProgressPercentage(teamup.current_participants, teamup.max_participants)}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              className="btn"
              onClick={() => router.push(`/teamups/${teamup.id}`)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              View Details
            </button>
            {isOwner && teamup.status === 'open' && (
              <button
                className="btn"
                onClick={() => router.push(`/teamups/${teamup.id}/requests`)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Manage Requests
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div style={{ padding: '2rem' }}>Checking authentication...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/teamups')}
          style={{ marginBottom: '1rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          ← Back to TeamUps
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>My TeamUps</h1>
          <button
            className="btn"
            onClick={() => router.push('/teamups/new')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create New TeamUp
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <button
            onClick={() => setActiveTab('created')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'created' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'created' ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === 'created' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Created by Me ({createdTeamUps.length})
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'joined' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'joined' ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === 'joined' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Joined by Me ({joinedTeamUps.length})
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '4px', marginBottom: '1rem' }}>
          <p style={{ margin: 0, color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div>Loading your teamups...</div>
      ) : (
        <div>
          {/* Created TeamUps Tab */}
          {activeTab === 'created' && (
            <div>
              {createdTeamUps.length === 0 ? (
                <div className="card" style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    You haven't created any teamups yet.
                  </p>
                  <button
                    className="btn"
                    onClick={() => router.push('/teamups/new')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Create Your First TeamUp
                  </button>
                </div>
              ) : (
                <div>
                  <div className="small" style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    TeamUps you have created and are managing
                  </div>
                  {createdTeamUps.map(teamup => renderTeamUpCard(teamup, true))}
                </div>
              )}
            </div>
          )}

          {/* Joined TeamUps Tab */}
          {activeTab === 'joined' && (
            <div>
              {joinedTeamUps.length === 0 ? (
                <div className="card" style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    You haven't joined any teamups yet.
                  </p>
                  <button
                    className="btn"
                    onClick={() => router.push('/teamups')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Browse TeamUps
                  </button>
                </div>
              ) : (
                <div>
                  <div className="small" style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    TeamUps you have joined as a participant
                  </div>
                  {joinedTeamUps.map(teamup => renderTeamUpCard(teamup, false))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
