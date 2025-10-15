'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apis } from '@/lib/api';

const SPORTS = ['basketball', 'badminton', 'running', 'gym', 'tennis'] as const;

interface VenueTimeslot {
  id: string;
  starts_at: string;
  ends_at: string;
  price: number;
  status: string;
  venue?: {
    id: string;
    name: string;
    city: string;
    address: string;
    sport_type?: string;
  };
}

export default function CreateTeamUpPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sportType, setSportType] = useState<string>('');
  const [minParticipants, setMinParticipants] = useState<number>(2);
  const [maxParticipants, setMaxParticipants] = useState<number>(10);
  const [deadline, setDeadline] = useState<string>('');
  const [courtTimeslotId, setCourtTimeslotId] = useState<string>('');

  // Venue search states
  const [searchCity, setSearchCity] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>('');
  const [searchSportType, setSearchSportType] = useState<string>('');
  const [availableTimeslots, setAvailableTimeslots] = useState<VenueTimeslot[]>([]);
  const [searchingVenues, setSearchingVenues] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login to create a teamup');
      router.push('/login');
      return;
    }

    try {
      const userData = await apis.auth.getMe();
      setUser(userData);
    } catch (err) {
      alert('Authentication failed. Please login again.');
      router.push('/login');
    }
  }

  async function searchVenueTimeslots() {
    if (!searchCity || !searchDate) {
      alert('Please provide city and date to search venues');
      return;
    }

    setSearchingVenues(true);
    setError(null);
    try {
      const results = await apis.venues.searchVenues({
        city: searchCity,
        date: new Date(searchDate),
        sportType: searchSportType || undefined,
      });

      // Flatten timeslots from all venues
      const timeslots: VenueTimeslot[] = [];
      results.forEach((result: any) => {
        if (result.timeslots) {
          result.timeslots.forEach((slot: any) => {
            timeslots.push({
              ...slot,
              venue: result.venue,
            });
          });
        }
      });

      // Filter for available timeslots only
      const available = timeslots.filter(slot => slot.status === 'available');
      setAvailableTimeslots(available);

      if (available.length === 0) {
        alert('No available timeslots found. Try different search criteria.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to search venues');
      console.error('Error searching venues:', err);
    } finally {
      setSearchingVenues(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert('Please provide a title');
      return;
    }

    if (!courtTimeslotId) {
      alert('Please select a venue timeslot');
      return;
    }

    if (minParticipants < 1) {
      alert('Minimum participants must be at least 1');
      return;
    }

    if (maxParticipants < minParticipants) {
      alert('Maximum participants must be greater than or equal to minimum participants');
      return;
    }

    // Check deadline is before the timeslot starts
    if (deadline) {
      const selectedTimeslot = availableTimeslots.find(slot => slot.id === courtTimeslotId);
      if (selectedTimeslot) {
        const deadlineDate = new Date(deadline);
        const timeslotStart = new Date(selectedTimeslot.starts_at);
        if (deadlineDate >= timeslotStart) {
          alert('Deadline must be before the timeslot starts');
          return;
        }
      }
    }

    setLoading(true);
    setError(null);

    try {
      const teamup = await apis.teamups.createTeamUp({
        createTeamUpRequest: {
          court_timeslot_id: courtTimeslotId,
          title: title.trim(),
          description: description.trim() || undefined,
          sport_type: sportType || undefined,
          min_participants: minParticipants,
          max_participants: maxParticipants,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
        }
      });

      alert('TeamUp created successfully!');
      router.push(`/teamups/${teamup.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create teamup');
      alert(err?.message || 'Failed to create teamup');
      console.error('Error creating teamup:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <div style={{ padding: '2rem' }}>Checking authentication...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/teamups')}
          style={{ marginBottom: '1rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          ← Back to TeamUps
        </button>
        <h1>Create New TeamUp</h1>
        <p style={{ color: '#6b7280' }}>
          Organize a sports activity by creating a teamup. Select a venue timeslot and set your requirements.
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '4px', marginBottom: '1rem' }}>
          <p style={{ margin: 0, color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {/* Venue Timeslot Selection */}
      <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>1. Select Venue & Timeslot</h2>
        <p className="small" style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Search for available venue timeslots for your activity.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                City <span style={{ color: 'red' }}>*</span>
              </div>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="e.g. Taipei"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </label>
          </div>

          <div>
            <label style={{ display: 'block' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Date <span style={{ color: 'red' }}>*</span>
              </div>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </label>
          </div>

          <div>
            <label style={{ display: 'block' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Sport Type
              </div>
              <select
                value={searchSportType}
                onChange={(e) => setSearchSportType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              >
                <option value="">All Sports</option>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
        </div>

        <button
          onClick={searchVenueTimeslots}
          disabled={searchingVenues || !searchCity || !searchDate}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: searchingVenues || !searchCity || !searchDate ? 'not-allowed' : 'pointer',
            opacity: searchingVenues || !searchCity || !searchDate ? 0.6 : 1
          }}
        >
          {searchingVenues ? 'Searching...' : 'Search Venues'}
        </button>

        {/* Available Timeslots */}
        {availableTimeslots.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div className="small" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
              Available Timeslots ({availableTimeslots.length})
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
              {availableTimeslots.map((slot) => (
                <label
                  key={slot.id}
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: courtTimeslotId === slot.id ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="timeslot"
                    value={slot.id}
                    checked={courtTimeslotId === slot.id}
                    onChange={(e) => setCourtTimeslotId(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ fontWeight: 500 }}>{slot.venue?.name}</span>
                  <span className="small" style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                    {new Date(slot.starts_at).toLocaleTimeString()} - {new Date(slot.ends_at).toLocaleTimeString()}
                  </span>
                  <span className="small" style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                    ${slot.price}
                  </span>
                  <div className="small" style={{ color: '#6b7280', marginLeft: '1.5rem' }}>
                    {slot.venue?.address}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {!courtTimeslotId && availableTimeslots.length === 0 && (
          <p className="small" style={{ color: '#6b7280', marginTop: '1rem', fontStyle: 'italic' }}>
            No timeslot selected. Please search and select a venue timeslot above.
          </p>
        )}
      </div>

      {/* TeamUp Details Form */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>2. TeamUp Details</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Title <span style={{ color: 'red' }}>*</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend Basketball Game"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Description
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your teamup activity..."
                rows={4}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Sport Type
              </div>
              <select
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              >
                <option value="">Not specified</option>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block' }}>
                <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                  Min Participants <span style={{ color: 'red' }}>*</span>
                </div>
                <input
                  type="number"
                  value={minParticipants}
                  onChange={(e) => setMinParticipants(Number(e.target.value))}
                  min={1}
                  max={maxParticipants}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </label>
              <p className="small" style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                Minimum number needed to confirm
              </p>
            </div>

            <div>
              <label style={{ display: 'block' }}>
                <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                  Max Participants <span style={{ color: 'red' }}>*</span>
                </div>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  min={minParticipants}
                  max={100}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </label>
              <p className="small" style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                Maximum capacity for this teamup
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block' }}>
              <div className="small" style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
                Application Deadline (optional)
              </div>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </label>
            <p className="small" style={{ color: '#6b7280', marginTop: '0.25rem' }}>
              Deadline for accepting applications. Must be before the activity starts.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => router.push('/teamups')}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !courtTimeslotId || !title.trim()}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !courtTimeslotId || !title.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !courtTimeslotId || !title.trim() ? 0.6 : 1,
              fontWeight: 500
            }}
          >
            {loading ? 'Creating...' : 'Create TeamUp'}
          </button>
        </div>
      </form>
    </div>
  );
}
