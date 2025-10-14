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

const SPORTS = ['basketball', 'badminton', 'running', 'gym', 'tennis'] as const;
const STATUSES = ['open', 'confirmed', 'cancelled'] as const;

export default function TeamUpsPage() {
  const router = useRouter();
  const [teamups, setTeamups] = useState<TeamUpOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [sportType, setSportType] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetchTeamUps();
  }, []);

  async function fetchTeamUps() {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params: any = {};
      if (sportType) params.sport_type = sportType;
      if (city) params.city = city;
      if (status) params.status = status;

      const list = await apis.teamups.getTeamUps(params);
      setTeamups(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load teamups');
      console.error('Error fetching teamups:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'open':
        return '#10b981'; // green
      case 'confirmed':
        return '#3b82f6'; // blue
      case 'cancelled':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  function getProgressPercentage(current: number, max: number): number {
    return Math.min((current / max) * 100, 100);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>TeamUps</h1>
        <button
          className="btn"
          onClick={() => router.push('/teamups/new')}
          style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Create TeamUp
        </button>
      </div>

      {/* Filters */}
      <div className="grid" style={{ marginBottom: '1rem' }}>
        <div>
          <label>
            Sport Type
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">All Sports</option>
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label>
            City
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Taipei"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </label>
        </div>
        <div>
          <label>
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="toolbar">
        <button className="btn" onClick={fetchTeamUps} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
        <button
          className="btn"
          onClick={() => {
            setSportType('');
            setCity('');
            setStatus('');
          }}
          disabled={loading}
        >
          Clear Filters
        </button>
        <button
          className="btn"
          onClick={() => router.push('/teamups/my')}
          style={{ marginLeft: 'auto' }}
        >
          My TeamUps
        </button>
      </div>

      {error && <p style={{ color: 'crimson', marginTop: '1rem' }}>{error}</p>}

      <div style={{ marginTop: '1rem' }}>
        {loading && <p>Loading teamups...</p>}
        {!loading && teamups.length === 0 && <p className="small">No teamups found. Try adjusting your filters or create a new teamup!</p>}

        {teamups.map(teamup => (
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

                {/* Deadline */}
                {teamup.deadline && (
                  <div className="small" style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                    <strong>Deadline:</strong> {new Date(teamup.deadline).toLocaleString()}
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

              {/* Action Button */}
              <div style={{ marginLeft: '1rem' }}>
                <button
                  className="btn"
                  onClick={() => router.push(`/teamups/${teamup.id}`)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: teamup.status === 'open' ? '#3b82f6' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: teamup.status === 'open' ? 'pointer' : 'not-allowed',
                    opacity: teamup.status === 'open' ? 1 : 0.6
                  }}
                  disabled={teamup.status !== 'open'}
                >
                  {teamup.status === 'open' ? 'View & Join' : 'View'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
