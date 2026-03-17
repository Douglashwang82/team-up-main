import sys
import os

# Add api root to path to import app modules
sys.path.append('/Users/hwangdouglas/Projects/team-up-main/services/api')

from app.core.db import SessionLocal
from app.models.event import Event
from app.models.booking import Booking
from app.models.venue import TimeSlot, Court, Venue
from sqlalchemy import select

def test_filters():
    with SessionLocal() as s:
        print("Total events:", len(s.execute(select(Event)).scalars().all()))
        
        # Base query
        q = select(Event)
        print("open events:", len(s.execute(q.where(Event.status == 'open')).scalars().all()))

        # Join query
        join_q = q.join(Booking, Booking.event_id == Event.id)\
                  .join(TimeSlot, Booking.time_slot_id == TimeSlot.id)\
                  .join(Court, TimeSlot.court_id == Court.id)\
                  .join(Venue, Court.venue_id == Venue.id)
        
        events_with_bookings = s.execute(join_q).scalars().all()
        print("Events with join:", len(events_with_bookings))

        if len(events_with_bookings) > 0:
            e = events_with_bookings[0]
            b = s.execute(select(Booking).where(Booking.event_id == e.id)).scalars().first()
            if b:
                ts = s.execute(select(TimeSlot).where(TimeSlot.id == b.time_slot_id)).scalars().first()
                c = s.execute(select(Court).where(Court.id == ts.court_id)).scalars().first()
                v = s.execute(select(Venue).where(Venue.id == c.venue_id)).scalars().first()
                
                print(f"Sample Event: {e.title}")
                print(f"Starts: {ts.starts_at}")
                print(f"Sport: {c.sport_type}")
                print(f"City: {v.city}")
                print(f"Has matching category '籃球': {c.sport_type == '籃球'}")

        # Test specific filter
        cat_q = join_q.where(Court.sport_type == '籃球')
        print("Events matching '籃球':", len(s.execute(cat_q).scalars().all()))
        
        cat_q2 = join_q.where(Court.sport_type == 'basketball')
        print("Events matching 'basketball':", len(s.execute(cat_q2).scalars().all()))

if __name__ == '__main__':
    test_filters()
