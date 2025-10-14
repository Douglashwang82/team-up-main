'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apis } from '@/lib/api';

// Types based on PRD specifications
interface TeamUpParticipant {
  id: string;
  user_id?: string;
  role: 'owner' | 'member';
  display_name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

interface TeamUpDetail {
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
    price: number;
    venue?: {
      id: string;
      name: string;
      city: string;
      address: string;
      sport_type?: string;
    };
  };
  participants?: TeamUpParticipant[];
  event_id?: string;
}

export default function TeamUpDetailPage() {
  const { teamupId } = useParams<{ teamupId: string }>();
  const router = useRouter();
  const [teamup, setTeamup] = useState<TeamUpDetail | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Join request form states
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = !!user;
  const isOwner = isLoggedIn && user?.id === teamup?.owner_user_id;

  useEffect(() => {
    fetchTeamUpDetails();
    fetchCurrentUser();
  }, [teamupId]);

  async function fetchTeamUpDetails() {
    setLoading(true);
    setError(null);
    try {
      const detail = await apis.teamups.getTeamUpById({ id: teamupId });
      setTeamup(detail);
    } catch (err: any) {
      setError(err?.message || 'Failed to load teamup details');
      console.error('Error fetching teamup:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCurrentUser() {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const userData = await apis.auth.getMe();
        setUser(userData);
        // Pre-fill form with user data if logged in
        if (userData.name) setApplicantName(userData.name);
        if (userData.email) setApplicantEmail(userData.email);
        if (userData.phone) setApplicantPhone(userData.phone);
      } catch (err) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }

  async function submitJoinRequest() {
    if (!isLoggedIn && !applicantName) {
      alert('Please provide your name');
      return;
    }

    setSubmitting(true);
    try {
      await apis.teamups.joinTeamUp({
        id: teamupId,
        joinTeamUpRequest: {
          applicant_name: applicantName,
          applicant_email: applicantEmail || undefined,
          applicant_phone: applicantPhone || undefined,
          message: message || undefined,
        }
      });
      alert('Join request submitted successfully! The organizer will review your request.');
      // Refresh teamup data
      await fetchTeamUpDetails();
      // Clear form
      setMessage('');
    } catch (err: any) {
      alert(err?.message || 'Failed to submit join request');
      console.error('Error submitting join request:', err);
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading teamup details...</div>;
  }

  if (error || !teamup) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'crimson' }}>{error || 'TeamUp not found'}</p>
        <button
          className="btn"
          onClick={() => router.push('/teamups')}
          style={{ marginTop: '1rem' }}
        >
          Back to TeamUps
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/teamups')}
          style={{ marginBottom: '1rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          ← Back to TeamUps
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1 style={{ margin: 0 }}>{teamup.title}</h1>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: getStatusColor(teamup.status),
              color: 'white'
            }}
          >
            {teamup.status}
          </span>
        </div>

        {teamup.description && (
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>{teamup.description}</p>
        )}
      </div>

      {/* Main Info Card */}
      <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>TeamUp Information</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Sport Type</div>
            <div style={{ fontWeight: 500 }}>{teamup.sport_type || 'Not specified'}</div>
          </div>
          <div>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Status</div>
            <div style={{ fontWeight: 500 }}>{teamup.status}</div>
          </div>
          <div>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Min Participants</div>
            <div style={{ fontWeight: 500 }}>{teamup.min_participants}</div>
          </div>
          <div>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Max Participants</div>
            <div style={{ fontWeight: 500 }}>{teamup.max_participants}</div>
          </div>
          {teamup.deadline && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Application Deadline</div>
              <div style={{ fontWeight: 500 }}>{new Date(teamup.deadline).toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Participants Progress */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 500 }}>
              Participants: {teamup.current_participants}/{teamup.max_participants}
            </span>
            {teamup.current_participants >= teamup.min_participants && (
              <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 500 }}>
                ✓ Minimum reached!
              </span>
            )}
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e5e7eb',
            borderRadius: '6px',
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

      {/* Venue & Timeslot Info */}
      {teamup.court_timeslot && (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>Venue & Time</h2>

          {teamup.court_timeslot.venue && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                {teamup.court_timeslot.venue.name}
              </div>
              <div className="small" style={{ color: '#6b7280' }}>
                {teamup.court_timeslot.venue.address}
              </div>
              <div className="small" style={{ color: '#6b7280' }}>
                {teamup.court_timeslot.venue.city}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Time Slot</div>
            <div style={{ fontWeight: 500 }}>
              {new Date(teamup.court_timeslot.starts_at).toLocaleString()} - {new Date(teamup.court_timeslot.ends_at).toLocaleTimeString()}
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div className="small" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Price</div>
            <div style={{ fontWeight: 500 }}>${teamup.court_timeslot.price}</div>
          </div>
        </div>
      )}

      {/* Participants List */}
      {teamup.participants && teamup.participants.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>Participants ({teamup.participants.length})</h2>

          <div style={{ marginTop: '1rem' }}>
            {teamup.participants.map((participant, index) => (
              <div
                key={participant.id}
                style={{
                  padding: '0.75rem',
                  borderBottom: index < teamup.participants!.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{participant.display_name}</div>
                    {participant.email && (
                      <div className="small" style={{ color: '#6b7280' }}>{participant.email}</div>
                    )}
                  </div>
                  {participant.role === 'owner' && (
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: '#f59e0b',
                      color: 'white'
                    }}>
                      Organizer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner Actions */}
      {isOwner && teamup.status === 'open' && (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem', backgroundColor: '#f9fafb' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>Organizer Actions</h2>
          <p className="small" style={{ color: '#6b7280', marginBottom: '1rem' }}>
            As the organizer, you can manage join requests for this teamup.
          </p>
          <button
            className="btn"
            onClick={() => router.push(`/teamups/${teamupId}/requests`)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Manage Join Requests
          </button>
        </div>
      )}

      {/* Event Link (if converted) */}
      {teamup.event_id && (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid #10b981', borderRadius: '8px', marginBottom: '1.5rem', backgroundColor: '#ecfdf5' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600, color: '#10b981' }}>
            ✓ TeamUp Confirmed!
          </h2>
          <p style={{ color: '#059669', marginBottom: '1rem' }}>
            This teamup has reached the minimum participants and has been converted to an event.
          </p>
          <button
            className="btn"
            onClick={() => router.push(`/events/${teamup.event_id}`)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Event
          </button>
        </div>
      )}

      {/* Join Request Form */}
      {teamup.status === 'open' && !isOwner && teamup.current_participants < teamup.max_participants && (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>Apply to Join</h2>

          {!isLoggedIn && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '4px', marginBottom: '1rem' }}>
              <p className="small" style={{ margin: 0, color: '#92400e' }}>
                You are not logged in. Please provide your contact information below.
              </p>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Name {!isLoggedIn && <span style={{ color: 'red' }}>*</span>}
              </div>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Your name"
                disabled={isLoggedIn}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: isLoggedIn ? '#f3f4f6' : 'white'
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Email (optional)
              </div>
              <input
                type="email"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isLoggedIn}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: isLoggedIn ? '#f3f4f6' : 'white'
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Phone (optional)
              </div>
              <input
                type="tel"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                placeholder="Your phone number"
                disabled={isLoggedIn}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: isLoggedIn ? '#f3f4f6' : 'white'
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Message (optional)
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the organizer why you want to join..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </label>

            <button
              onClick={submitJoinRequest}
              disabled={submitting || (!isLoggedIn && !applicantName)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting || (!isLoggedIn && !applicantName) ? 'not-allowed' : 'pointer',
                opacity: submitting || (!isLoggedIn && !applicantName) ? 0.6 : 1,
                fontWeight: 500
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Join Request'}
            </button>
          </div>
        </div>
      )}

      {/* Closed for applications */}
      {(teamup.status !== 'open' || teamup.current_participants >= teamup.max_participants) && !isOwner && (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
          <p style={{ margin: 0, color: '#6b7280', textAlign: 'center' }}>
            {teamup.status !== 'open'
              ? 'This teamup is no longer accepting applications.'
              : 'This teamup has reached maximum capacity.'}
          </p>
        </div>
      )}
    </div>
  );
}
