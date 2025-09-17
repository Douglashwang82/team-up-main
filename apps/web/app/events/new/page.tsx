'use client';
import { useState } from 'react';
import { apis } from '@/lib/api';

export default function NewEvent(){
  const [title,setTitle]=useState('Basketball 5v5');
  const [sport,setSport]=useState('basketball');
  const [startsAt,setStartsAt]=useState('2025-09-01T19:00');
  const [endsAt,setEndsAt]=useState('2025-09-01T21:00');
  const [capacity,setCapacity]=useState(10);
  const [lat,setLat]=useState(25.033);
  const [lng,setLng]=useState(121.565);
  const [status,setStatus]=useState<string|null>(null);

  async function create(e:React.FormEvent){
    e.preventDefault(); setStatus(null);
    try{
  // Convert to UTC ISO8601 string including time
  console.log(startsAt, endsAt);
  const startsAtIso = startsAt ? new Date(startsAt).toISOString() : undefined;
  console.log(startsAt, startsAtIso);
  const endsAtIso = endsAt ? new Date(endsAt).toISOString() : undefined;
  console.log(endsAt, endsAtIso);
  const startsAtDate = startsAt ? new Date(startsAt) : undefined;
  const endsAtDate = endsAt ? new Date(endsAt) : undefined;
  if (!startsAtDate || !endsAtDate) {
    setStatus('Please provide valid start and end times.');
    return;
  }
  const res = await apis.events.createEvent({eventCreateIn: {title,sport_type: sport as any, starts_at: startsAtDate, ends_at: endsAtDate, capacity, lat, lng}});
      setStatus('Created: '+res.id);
    }catch(e:any){ setStatus(e?.message||'Failed'); }
  }

  return(<div><h1>New Event</h1><form onSubmit={create}>
    <input value={title} onChange={e=>setTitle(e.target.value)} />
    <input value={startsAt} onChange={e=>setStartsAt(e.target.value)} type='datetime-local' />
    <input value={endsAt} onChange={e=>setEndsAt(e.target.value)} type='datetime-local' />
    <input value={capacity} onChange={e=>setCapacity(Number(e.target.value))} type='number' />
    <button>Create</button>
    {status && <p>{status}</p>}
  </form></div>);
}
