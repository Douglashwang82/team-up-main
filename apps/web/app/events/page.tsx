'use client';

import { useEffect, useState } from 'react';
import { apis } from '@/lib/api';
import type { EventOut as ApiEventOut } from '@team-up-main/api-client';
import { toUtcIso } from '@/lib/utils';

type EventOut = ApiEventOut;
const SPORTS = ['basketball','badminton','running','gym','tennis'] as const;


export default function EventsPage() {
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [radius, setRadius] = useState<number>(5);
  const [sport, setSport] = useState<'' | string>('');
  const [events, setEvents] = useState<EventOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');


  // Optional: auto-fill lat/lng from browser geolocation
  // useEffect(() => {
  //   if (typeof navigator !== 'undefined' && lat === '' && lng === '') {
  //     navigator.geolocation?.getCurrentPosition((pos) => {
  //       setLat(parseFloat(pos.coords.latitude.toFixed(5)));
  //       setLng(parseFloat(pos.coords.longitude.toFixed(5)));
  //       console.log('setting');
  //     });
  //   }
  // }, [lat, lng]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const startIso = toUtcIso(start, "00:00:00");
      const endIso = toUtcIso(end, "23:59:59");
      const list = await apis.events.getEventsPoint({ 
        lat: Number(lat),
        lng: Number(lng), 
        radius: Number(radius) || 5,
        sportType: sport || undefined,
        startAt: startIso,
        endAt: endIso,
      });
      console.log('Fetching events with:', { lat, lng, radius, sport });

      setEvents(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllEvents() {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching all events');
      const list = await apis.events.getAllEvents();
      setEvents(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Events</h1>
      <div className="grid">
        <div>
          <label>Latitude
            <input value={lat} onChange={e => setLat(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 25.04" />
          </label>
        </div>
        <div>
          <label>Longitude
            <input value={lng} onChange={e => setLng(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 121.56" />
          </label>
        </div>
      </div>
      <div className="grid">
        <div>
          <label>Radius (km)
            <input value={radius} onChange={e => setRadius(Number(e.target.value))} type="number" min={1} max={50} />
          </label>
        </div>
        <div>
          <label>Sport (optional)
            <select
              value={sport}
              onChange={(e) => setSport((e.target.value || '') as '' | string)}>
              <option value="">--Any--</option>
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label>Start (optional)
            <input type="date" value={start} onChange={e => setStart(e.target.value)} />
          </label>
        </div>
        <div>
          <label>End (optional)
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
          </label>
        </div>
      </div>
      <div className="toolbar">
        <button className="btn" onClick={fetchEvents} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
        <button className="btn" onClick={fetchAllEvents} disabled={loading}>
          {loading ? 'Loading...' : 'Load All'}
        </button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <div>
        {events.length === 0 && <p className="small">No events loaded. Try pressing Search.</p>}
        {events.map(ev => (
          <div key={ev.id} className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{ev.title}</div>
                <div className="small">{ev.sport_type} • {ev?.starts_at.toLocaleString()} - {new Date(ev.ends_at).toLocaleString()}</div>
                {typeof ev.capacity === 'number' && <div className="small">Attending {ev.capacity}/{ev.capacity}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
