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
      const res = await apis.events.eventsPost({eventCreateIn: {title,sport: sport as any, starts_at:new Date(startsAt), ends_at:new Date(endsAt), capacity, lat, lng}});
      setStatus('Created: '+res.id);
    }catch(e:any){ setStatus(e?.message||'Failed'); }
  }

  return(<div><h1>New Event</h1><form onSubmit={create}>
    <input value={title} onChange={e=>setTitle(e.target.value)} />
    <input value={startsAt} onChange={e=>setStartsAt(e.target.value)} type='datetime-local' />
    <input value={endsAt} onChange={e=>setEndsAt(e.target.value)} type='datetime-local' />
    <button>Create</button>
    {status && <p>{status}</p>}
  </form></div>);
}
