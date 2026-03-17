'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apis } from '@/lib/api';
import { TimeSlotOut, EventOut, VenueDetail, CourtOut } from '@team-up-main/api-client';
import { format, addDays } from 'date-fns';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/contexts/ToastContext';
import { Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CourtBookingPage() {
  const { id: venueId, courtId } = useParams() as { id: string, courtId: string };
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [court, setCourt] = useState<CourtOut | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlotOut[]>([]);
  const [myEvents, setMyEvents] = useState<EventOut[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  // Generate an array of next 7 days
  const upcomingDays = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [vData, cData, eData] = await Promise.all([
          apis.venues.getVenueById({ venueId }),
          apis.venues.getCourt({ venueId, courtId }),
          user ? apis.events.getMyCreatedEvents() : Promise.resolve([])
        ]);
        setVenue(vData);
        setCourt(cData);
        // Default select first event if user owns any
        if (eData.length > 0) {
          setMyEvents(eData);
          setSelectedEventId(eData[0].id);
        }
      } catch (err) {
        console.error('Initial fetch failed', err);
        showToast('Failed to load court details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (venueId && courtId) {
      fetchInitialData();
    }
  }, [venueId, courtId, user]);

  // Refetch timeslots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const slots = await apis.venues.getCourtTimeSlots({
          venueId,
          courtId,
          date: selectedDate
        });
        setTimeSlots(slots);
      } catch (err) {
        console.error('Failed to fetch timeslots', err);
      }
    };
    if (venueId && courtId) {
      fetchTimeSlots();
    }
  }, [venueId, courtId, selectedDate]);

  const toggleSlot = (slotId: string) => {
    const newSet = new Set(selectedSlotIds);
    if (newSet.has(slotId)) newSet.delete(slotId);
    else newSet.add(slotId);
    setSelectedSlotIds(newSet);
  };

  const handleBookSelected = async () => {
    if (!selectedEventId) {
      showToast('Please select a TeamUp event to link this booking to', 'error');
      return;
    }
    
    setIsBooking(true);
    try {
      // API currently allows booking one timeslot at a time according to OAS
      for (const slotId of selectedSlotIds) {
        await apis.events.bookTimeslotForEvent({
          eventId: selectedEventId,
          eventBookTimeSlotIn: { timeSlotId: slotId }
        });
      }
      showToast(`Successfully booked ${selectedSlotIds.size} slot(s)!`, 'success');
      setSelectedSlotIds(new Set());
      // Re-fetch slots to update their availability
      const slots = await apis.venues.getCourtTimeSlots({ venueId, courtId, date: selectedDate });
      setTimeSlots(slots);
      
      // Optionally route back
      router.push(`/teamups/${selectedEventId}`);
    } catch (err: any) {
      console.error('Booking failed', err);
      showToast(err?.message || 'Failed to book slot(s)', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      <Link href={`/venues/${venueId}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Venue
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50">
           <div>
             <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{court?.name}</h1>
             <p className="text-gray-600 mt-1">{venue?.name}</p>
           </div>
           
           <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-semibold capitalize">
               {court?.sportType}
             </span>
             <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-semibold capitalize">
               {court?.surfaceType}
             </span>
           </div>
        </div>
        
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left column: Date selector & Slots */}
           <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                   <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                   Select Date
                </h3>
                
                <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
                  {upcomingDays.map((d, i) => {
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    return (
                      <button 
                        key={i}
                        onClick={() => { setSelectedDate(d); setSelectedSlotIds(new Set()); }}
                        className={`min-w-[4.5rem] flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-colors snap-start ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                        }`}
                      >
                        <span className="text-xs uppercase font-medium">{format(d, 'EEE')}</span>
                        <span className="text-xl font-bold mt-1">{format(d, 'd')}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div>
                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                    Available Time Slots
                 </h3>
                 
                 {timeSlots.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                       <p className="text-gray-500">No time slots configured for this date.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {timeSlots.map(slot => {
                          const isSelected = selectedSlotIds.has(slot.id);
                          const isBooked = slot.status === 'booked'; 
                          
                          return (
                            <button
                               key={slot.id}
                               disabled={isBooked}
                               onClick={() => toggleSlot(slot.id)}
                               className={`
                                 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all 
                                 ${isBooked ? 'bg-gray-100 border-gray-100 opacity-50 cursor-not-allowed' : 
                                   isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300'}
                               `}
                            >
                               <span className={`font-semibold text-lg ${isBooked ? 'text-gray-500' : isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                  {format(new Date(slot.startsAt), 'HH:mm')}
                               </span>
                               <span className="text-xs text-gray-400 mt-1">
                                  {isBooked ? 'Booked' : `$${slot.price || 0}/hr`}
                               </span>
                            </button>
                          );
                       })}
                    </div>
                 )}
              </div>
           </div>
           
           {/* Right column: Booking summary & Action */}
           <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-6">
                 <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">Booking Details</h3>
                 
                 <div className="space-y-4 mb-8 text-sm">
                    <div className="flex justify-between">
                       <span className="text-gray-500">Date</span>
                       <span className="font-medium text-gray-900">{format(selectedDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-500">Slots Selected</span>
                       <span className="font-medium text-gray-900">{selectedSlotIds.size}</span>
                    </div>
                 </div>
                 
                 {!user ? (
                   <div className="text-center">
                     <p className="text-sm text-gray-600 mb-4">Please sign in to book courts.</p>
                     <button
                       onClick={() => router.push('/login')}
                       className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium"
                     >
                       Sign In
                     </button>
                   </div>
                 ) : myEvents.length === 0 ? (
                   <div className="text-center">
                     <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                       You need to be an owner of an Event to book a court.
                     </p>
                     <Link href="/teamups/create" className="w-full inline-block py-3 bg-gray-900 text-white rounded-xl font-medium">
                        Create Event First
                     </Link>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Link to TeamUp Event
                        </label>
                        <select 
                          className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-blue-500 focus:border-blue-500"
                          value={selectedEventId}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                        >
                          {myEvents.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.title}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        onClick={handleBookSelected}
                        disabled={selectedSlotIds.size === 0 || isBooking}
                        className="w-full flex items-center justify-center py-3.5 bg-blue-600 text-white rounded-xl shadow-sm text-base font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                         {isBooking ? 'Processing...' : `Book ${selectedSlotIds.size} Slot(s)`}
                      </button>
                   </div>
                 )}
              </div>
           </div>
           
        </div>
      </div>
    </div>
  );
}
