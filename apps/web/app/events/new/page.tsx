'use client';
import { useState, useEffect, useRef } from 'react';
import { apis } from '@/lib/api';

export default function NewEvent(){
  const [title,setTitle]=useState('Basketball 5v5');
  const [bookingId,setBookingId]=useState('');
  const [visibility,setVisibility]=useState<'public'|'invite_only'|'private'>('public');
  const [status,setStatus]=useState<string|null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function create(e:React.FormEvent){
    e.preventDefault(); setStatus(null);
    try{
      if (!bookingId) {
        setStatus('Please provide a booking ID.');
        return;
      }
      const res = await apis.events.createEvent({eventCreateIn: {title, booking_id: bookingId, visibility}});
      setStatus('Created: '+res.id);
    }catch(e:any){ setStatus(e?.message||'Failed'); }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd + Enter to submit form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
      // Ctrl/Cmd + K to clear form
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setTitle('Basketball 5v5');
        setBookingId('');
        setVisibility('public');
        setStatus(null);
      }
      // Ctrl/Cmd + 1/2/3 to change visibility
      if ((e.ctrlKey || e.metaKey) && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        if (e.key === '1') setVisibility('public');
        if (e.key === '2') setVisibility('invite_only');
        if (e.key === '3') setVisibility('private');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return(<div><h1>New Event</h1><form ref={formRef} onSubmit={create}>
    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Event title" />
    <input value={bookingId} onChange={e=>setBookingId(e.target.value)} placeholder="Booking ID" />
    <select value={visibility} onChange={e=>setVisibility(e.target.value as 'public'|'invite_only'|'private')}>
      <option value="public">Public (Ctrl+1)</option>
      <option value="invite_only">Invite Only (Ctrl+2)</option>
      <option value="private">Private (Ctrl+3)</option>
    </select>
    <button>Create (Ctrl+Enter)</button>
    {status && <p>{status}</p>}
    <p style={{fontSize: '0.875rem', color: '#666', marginTop: '1rem'}}>
      Shortcuts: Ctrl+Enter (Submit) | Ctrl+K (Clear) | Ctrl+1/2/3 (Visibility)
    </p>
  </form></div>);
}
