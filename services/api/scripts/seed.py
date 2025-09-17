# scripts/seed_data.py
from passlib.hash import bcrypt
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.db import SessionLocal
from app.models.user import User
from app.models.venue import Venue, VenueTimeslot
from app.models.booking import Booking
from app.models.event import Event
from app.models.participant import EventParticipant
from app.core.security import gen_invite_token

def seed():
    with SessionLocal() as s:
        # 建立一個 user (owner)
        existing_user = s.query(User).filter_by(email="you@example.com").first()
        if not existing_user:
            user = User(
                id=uuid.uuid4(),
                display_name="Test Owner",
                email="you@example.com",
                password_hash=bcrypt.hash("p@ssw0rd"))
            s.add(user); s.commit(); s.refresh(user)
        else:
            user = existing_user
            print(user)

        # 建立一個 venue
        venue = Venue(
            id=uuid.uuid4(),
            name="Downtown Court",
            address="123 Main St",
            city="Dallas",
            geo_point=func.ST_GeomFromText('POINT(121.565 25.033)', 4326)
        )
        s.add(venue) ; s.commit(); s.refresh(venue)

        # 建立兩個 timeslots
        now = datetime.now(timezone.utc)
        ts1 = VenueTimeslot(
            id=uuid.uuid4(),
            venue_id=venue.id,
            starts_at=now + timedelta(days=1),
            ends_at=now + timedelta(days=1, hours=2),
            sport_type="basketball",
            price_cents=1000,
            currency="USD",
            is_bookable=True,
        )
        ts2 = VenueTimeslot(
            id=uuid.uuid4(),
            venue_id=venue.id,
            starts_at=now + timedelta(days=2),
            ends_at=now + timedelta(days=2, hours=2),
            sport_type="basketball",
            price_cents=1200,
            currency="USD",
            is_bookable=True,
        )
        s.add_all([ts1, ts2])
        s.commit()
        s.refresh(ts1)
        s.refresh(ts2)

        # 建立一個 booking (owner 訂第一個時段)
        booking = Booking(
            id=uuid.uuid4(),
            user_id=user.id,
            venue_id=venue.id,
            timeslot_id=ts1.id,
            status="confirmed",
            payment_status="none",
        )
        s.add(booking)

        # 建立一個 event (invite_only)
        event = Event(
            id=uuid.uuid4(),
            title="Pickup Game Test",
            sport_type="basketball",
            booking_id=booking.id,
            owner_user_id=user.id,
            visibility="invite_only",
            invite_token=gen_invite_token(),
            capacity=10,
            status="open",
            starts_at=ts1.starts_at,
            ends_at=ts1.ends_at,
        )
        s.add(event)

        # owner 加入 participants
        s.add(EventParticipant(
            event_id=event.id,
            user_id=user.id,
            role="owner",
            display_name="Test Owner",
            email="owner@example.com"
        ))

        s.commit()
        print("✅ Seed completed")
        print("User:", user.id)
        print("Venue:", venue.id)
        print("Timeslot1:", ts1.id)
        print("Booking:", booking.id)
        print("Event:", event.id)
        print("Invite Token:", event.invite_token)

if __name__ == "__main__":
    seed()
