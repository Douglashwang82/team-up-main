"""
Seed script for TeamUp database
Creates sample data for all models including users, venues, courts, time slots, events, bookings, and participants

Usage:
    python seed.py
"""
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
import bcrypt

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from werkzeug.security import generate_password_hash
from geoalchemy2 import WKTElement

from app.core.db import engine, Base
from app.models.user import User
from app.models.venue import Venue, Court, TimeSlot
from app.models.event import Event
from app.models.event_participant import EventParticipant
from app.models.event_join_request import EventJoinRequest
from app.models.booking import Booking
from app.core.types import Visibility, BookingStatus, PaymentStatus, joinRequestStatus


def clear_all_data(session: Session):
    """Clear all existing data from tables"""
    print("🗑️  Clearing existing data...")

    # Delete in reverse order of dependencies
    session.query(EventParticipant).delete()
    session.query(EventJoinRequest).delete()
    session.query(Booking).delete()
    session.query(Event).delete()
    session.query(TimeSlot).delete()
    session.query(Court).delete()
    session.query(Venue).delete()
    session.query(User).delete()

    session.commit()
    print("✅ All data cleared")


def create_users(session: Session) -> list[User]:
    """Create sample users"""
    print("\n👤 Creating users...")

    users_data = [
        {
            "email": "alice@example.com",
            "password": "password123",
            "display_name": "Alice Chen",
            "phone": "+886-912-345-678"
        },
        {
            "email": "bob@example.com",
            "password": "password123",
            "display_name": "Bob Wang",
            "phone": "+886-923-456-789"
        },
        {
            "email": "charlie@example.com",
            "password": "password123",
            "display_name": "Charlie Lin",
            "phone": "+886-934-567-890"
        },
        {
            "email": "diana@example.com",
            "password": "password123",
            "display_name": "Diana Wu",
            "phone": "+886-945-678-901"
        },
        {
            "email": "evan@example.com",
            "password": "password123",
            "display_name": "Evan Lee",
            "phone": "+886-956-789-012"
        },
        {
            "email": "fiona@example.com",
            "password": "password123",
            "display_name": "Fiona Zhang",
            "phone": "+886-967-890-123"
        },
    ]

    users = []
    for data in users_data:
        user = User(
            email=data["email"],
            password_hash=bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            display_name=data["display_name"],
            phone=data.get("phone")
        )
        session.add(user)
        users.append(user)

    session.commit()
    print(f"✅ Created {len(users)} users")
    return users


def create_venues_and_courts(session: Session) -> tuple[list[Venue], list[Court]]:
    """Create sample venues with courts"""
    print("\n🏟️  Creating venues and courts...")

    venues_data = [
        {
            "name": "Taipei Sports Center",
            "address": "No. 10, Nanjing East Road, Section 4, Songshan District",
            "city": "Taipei",
            "lat": 25.0520,
            "lng": 121.5491,
            "contact_phone": "+886-2-2570-2330",
            "partner_code": "TSC001",
            "courts": [
                {"name": "Court A", "sport_type": "basketball"},
                {"name": "Court B", "sport_type": "basketball"},
                {"name": "Court C", "sport_type": "badminton"},
                {"name": "Court D", "sport_type": "badminton"},
            ]
        },
        {
            "name": "Xinyi Sports Complex",
            "address": "No. 99, Songshou Road, Xinyi District",
            "city": "Taipei",
            "lat": 25.0363,
            "lng": 121.5645,
            "contact_phone": "+886-2-2723-5200",
            "partner_code": "XSC001",
            "courts": [
                {"name": "Main Court", "sport_type": "basketball"},
                {"name": "Practice Court 1", "sport_type": "basketball"},
                {"name": "Practice Court 2", "sport_type": "volleyball"},
            ]
        },
        {
            "name": "Da'an Fitness Center",
            "address": "No. 55, Section 2, Xinsheng South Road, Da'an District",
            "city": "Taipei",
            "lat": 25.0261,
            "lng": 121.5332,
            "contact_phone": "+886-2-2362-5566",
            "partner_code": "DFC001",
            "courts": [
                {"name": "Indoor Court 1", "sport_type": "badminton"},
                {"name": "Indoor Court 2", "sport_type": "badminton"},
                {"name": "Tennis Court A", "sport_type": "tennis"},
                {"name": "Tennis Court B", "sport_type": "tennis"},
            ]
        },
        {
            "name": "Banqiao Stadium",
            "address": "No. 8, Wenhua Road, Banqiao District",
            "city": "New Taipei City",
            "lat": 25.0141,
            "lng": 121.4627,
            "contact_phone": "+886-2-2272-8666",
            "partner_code": "BQS001",
            "courts": [
                {"name": "Basketball Court 1", "sport_type": "basketball"},
                {"name": "Basketball Court 2", "sport_type": "basketball"},
                {"name": "Volleyball Court", "sport_type": "volleyball"},
            ]
        },
        {
            "name": "Tamsui Riverside Park",
            "address": "Riverside Road, Tamsui District",
            "city": "New Taipei City",
            "lat": 25.1740,
            "lng": 121.4458,
            "contact_phone": "+886-2-2621-2345",
            "partner_code": "TRP001",
            "courts": [
                {"name": "Outdoor Court 1", "sport_type": "basketball"},
                {"name": "Outdoor Court 2", "sport_type": "basketball"},
            ]
        },
    ]

    venues = []
    all_courts = []

    for venue_data in venues_data:
        # Create point using WKT (Well-Known Text) format for PostGIS
        point = WKTElement(f'POINT({venue_data["lng"]} {venue_data["lat"]})', srid=4326)

        venue = Venue(
            name=venue_data["name"],
            address=venue_data["address"],
            city=venue_data["city"],
            geo_point=point,
            contact_phone=venue_data["contact_phone"],
            partner_code=venue_data.get("partner_code")
        )
        session.add(venue)
        session.flush()  # Get the venue ID

        # Create courts for this venue
        for court_data in venue_data["courts"]:
            court = Court(
                venue_id=venue.id,
                name=court_data["name"],
                sport_type=court_data["sport_type"]
            )
            session.add(court)
            all_courts.append(court)

        venues.append(venue)

    session.commit()
    print(f"✅ Created {len(venues)} venues with {len(all_courts)} courts")
    return venues, all_courts


def create_time_slots(session: Session, courts: list[Court]) -> list[TimeSlot]:
    """Create sample time slots for the next 14 days"""
    print("\n⏰ Creating time slots...")

    time_slots = []
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Create time slots for next 14 days
    for day_offset in range(14):
        date = today + timedelta(days=day_offset)

        # Create time slots: 9-11, 11-13, 14-16, 16-18, 18-20, 20-22
        slot_definitions = [
            (9, 11, 800),   # Morning - 800 TWD
            (11, 13, 800),
            (14, 16, 1000), # Afternoon - 1000 TWD
            (16, 18, 1000),
            (18, 20, 1200), # Evening - 1200 TWD (peak)
            (20, 22, 1200),
        ]

        # Create slots for each court
        for court in courts:
            for start_hour, end_hour, price in slot_definitions:
                starts_at = date.replace(hour=start_hour, minute=0, second=0)
                ends_at = date.replace(hour=end_hour, minute=0, second=0)

                # Make some slots not bookable (already reserved by venue)
                is_bookable = day_offset > 0  # Today's slots are not bookable

                time_slot = TimeSlot(
                    court_id=court.id,
                    starts_at=starts_at,
                    ends_at=ends_at,
                    price_cents=price * 100,  # Convert to cents
                    currency="TWD",
                    is_bookable=is_bookable
                )
                session.add(time_slot)
                time_slots.append(time_slot)

    session.commit()
    print(f"✅ Created {len(time_slots)} time slots")
    return time_slots


def create_events(session: Session, users: list[User], time_slots: list[TimeSlot]) -> list[Event]:
    """Create sample Events"""
    print("\n⚽ Creating Events...")

    events_data = [
        {
            "title": "Weekend Basketball Game",
            "description": "Looking for players for a friendly basketball game this weekend. All skill levels welcome!",
            "owner": users[0],  # Alice
            "max_participants": 10,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "temporary",
        },
        {
            "title": "Badminton Doubles Practice",
            "description": "Regular badminton practice for intermediate players. Let's improve together!",
            "owner": users[1],  # Bob
            "max_participants": 8,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "Friday Night Hoops",
            "description": "Weekly Friday night basketball. Competitive but fun!",
            "owner": users[2],  # Charlie
            "max_participants": 12,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "Tennis Club - Beginner Friendly",
            "description": "New tennis group for beginners. Coach available for guidance.",
            "owner": users[3],  # Diana
            "max_participants": 6,
            "visibility": Visibility.private.value,
            "status": "open",
            "duration_type": "permanent",
            "invite_token": "TENNIS2024ABC",
        },
        {
            "title": "Volleyball Tournament Prep",
            "description": "Preparing for upcoming tournament. Experienced players only.",
            "owner": users[4],  # Evan
            "max_participants": 8,
            "visibility": Visibility.private.value,
            "status": "closed",
            "duration_type": "temporary",
        },
        {
            "title": "Sunday Morning Badminton",
            "description": "Relaxed badminton session for Sunday morning. Coffee afterwards!",
            "owner": users[5],  # Fiona
            "max_participants": 8,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "temporary",
        },
    ]

    events = []
    for data in events_data:
        event = Event(
            title=data["title"],
            description=data["description"],
            owner_user_id=data["owner"].id,
            max_participants=data["max_participants"],
            visibility=data["visibility"],
            status=data["status"],
            duration_type=data["duration_type"],
            invite_token=data.get("invite_token"),
        )
        session.add(event)
        events.append(event)

    session.commit()
    print(f"✅ Created {len(events)} Events")
    return events


def create_participants(session: Session, events: list[Event], users: list[User]):
    """Create Event participants"""
    print("\n👥 Creating participants...")

    participants_count = 0

    # Event 0: Weekend Basketball (Alice's team)
    # Owner + 3 members
    for i, user in enumerate([users[0], users[1], users[2], users[3]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[0].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 1: Badminton Doubles (Bob's team)
    # Owner + 2 members
    for i, user in enumerate([users[1], users[4], users[5]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[1].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 2: Friday Night Hoops (Charlie's team) - CONFIRMED with full roster
    # Owner + 5 members
    for i, user in enumerate([users[2], users[0], users[1], users[3], users[4], users[5]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[2].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 3: Tennis Club (Diana's team)
    # Owner + 1 member
    for i, user in enumerate([users[3], users[2]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[3].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 4: Volleyball Tournament (Evan's team) - CONFIRMED
    # Owner + 5 members
    for i, user in enumerate([users[4], users[0], users[1], users[2], users[3], users[5]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[4].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 5: Sunday Badminton (Fiona's team)
    # Owner + 2 members
    for i, user in enumerate([users[5], users[1], users[3]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[5].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    session.commit()
    print(f"✅ Created {participants_count} participants")


def create_join_requests(session: Session, events: list[Event], users: list[User]):
    """Create sample join requests"""
    print("\n📝 Creating join requests...")

    requests_data = [
        {
            "event": events[0],  # Weekend Basketball
            "applicant": users[4],  # Evan
            "message": "I'd love to join! I play center position.",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[0],  # Weekend Basketball
            "applicant": users[5],  # Fiona
            "message": "Can I join? I'm a beginner but eager to learn!",
            "status": joinRequestStatus.approved.value,
        },
        {
            "event": events[1],  # Badminton Doubles
            "applicant": users[3],  # Diana
            "message": "Looking for regular practice partners!",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[3],  # Tennis Club (invite-only)
            "applicant": users[0],  # Alice
            "message": "Got the invite token from a friend. Excited to learn!",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[5],  # Sunday Badminton
            "applicant": users[2],  # Charlie
            "message": "Perfect timing! Count me in.",
            "status": joinRequestStatus.rejected.value,
        },
    ]

    for data in requests_data:
        request = EventJoinRequest(
            event_id=data["event"].id,
            applicant_user_id=data["applicant"].id,
            applicant_name=data["applicant"].display_name,
            applicant_email=data["applicant"].email,
            applicant_phone=data["applicant"].phone,
            message=data["message"],
            status=data["status"],
            reviewed_at=datetime.now(timezone.utc) if data["status"] != joinRequestStatus.submitted.value else None,
        )
        session.add(request)

    session.commit()
    print(f"✅ Created {len(requests_data)} join requests")


def create_bookings(session: Session, events: list[Event], users: list[User], time_slots: list[TimeSlot]):
    """Create sample bookings"""
    print("\n📅 Creating bookings...")

    # Filter bookable time slots
    bookable_time_slots = [ts for ts in time_slots if ts.is_bookable]

    bookings_data = [
        # Event bookings
        {
            "owner": users[0],  # Alice
            "event": events[0],  # Weekend Basketball
            "time_slot": bookable_time_slots[5],  # Saturday morning
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[1],  # Bob
            "event": events[1],  # Badminton Doubles
            "time_slot": bookable_time_slots[15],  # Next week
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.pending.value,
        },
        {
            "owner": users[2],  # Charlie
            "event": events[2],  # Friday Night Hoops (confirmed event)
            "time_slot": bookable_time_slots[25],  # Friday evening
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[3],  # Diana
            "event": events[3],  # Tennis Club
            "time_slot": bookable_time_slots[35],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[4],  # Evan
            "event": events[4],  # Volleyball Tournament
            "time_slot": bookable_time_slots[45],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[5],  # Fiona
            "event": events[5],  # Sunday Badminton
            "time_slot": bookable_time_slots[55],  # Sunday morning
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.pending.value,
        },
        # Individual bookings (no event)
        {
            "owner": users[0],  # Alice - individual booking
            "event": None,
            "time_slot": bookable_time_slots[10],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[1],  # Bob - individual booking
            "event": None,
            "time_slot": bookable_time_slots[20],
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.none.value,
        },
        {
            "owner": users[3],  # Diana - cancelled booking
            "event": None,
            "time_slot": bookable_time_slots[30],
            "status": BookingStatus.cancelled.value,
            "payment_status": PaymentStatus.failed.value,
        },
    ]

    event_booking_count = 0
    for data in bookings_data:
        booking = Booking(
            owner_user_id=data["owner"].id,
            time_slot_id=data["time_slot"].id,
            event_id=data["event"].id if data.get("event") else None,
            status=data["status"],
            payment_status=data["payment_status"],
        )
        session.add(booking)
        if data.get("event"):
            event_booking_count += 1

    session.commit()
    print(f"✅ Created {len(bookings_data)} bookings ({event_booking_count} assigned to Events)")


def print_summary(session: Session):
    """Print summary of seeded data"""
    print("\n" + "="*60)
    print("📊 SEEDING SUMMARY")
    print("="*60)

    user_count = session.query(User).count()
    venue_count = session.query(Venue).count()
    court_count = session.query(Court).count()
    time_slot_count = session.query(TimeSlot).count()
    event_count = session.query(Event).count()
    participant_count = session.query(EventParticipant).count()
    join_request_count = session.query(EventJoinRequest).count()
    booking_count = session.query(Booking).count()

    print(f"👤 Users:              {user_count}")
    print(f"🏟️  Venues:             {venue_count}")
    print(f"🎾 Courts:             {court_count}")
    print(f"⏰ Time Slots:          {time_slot_count}")
    print(f"⚽ Events:              {event_count}")
    print(f"👥 Participants:       {participant_count}")
    print(f"📝 Join Requests:      {join_request_count}")
    print(f"📅 Bookings:           {booking_count}")
    print("="*60)

    print("\n📧 Test User Credentials:")
    print("-" * 60)
    print("Email: alice@example.com   | Password: password123")
    print("Email: bob@example.com     | Password: password123")
    print("Email: charlie@example.com | Password: password123")
    print("Email: diana@example.com   | Password: password123")
    print("Email: evan@example.com    | Password: password123")
    print("Email: fiona@example.com   | Password: password123")
    print("-" * 60)


def main():
    """Main seeding function"""
    print("="*60)
    print("🌱 TEAMUP DATABASE SEEDING")
    print("="*60)

    # Create database session
    with Session(engine) as session:
        # Clear existing data
        clear_all_data(session)

        # Create data
        users = create_users(session)
        venues, courts = create_venues_and_courts(session)
        time_slots = create_time_slots(session, courts)
        events = create_events(session, users, time_slots)
        create_participants(session, events, users)
        create_join_requests(session, events, users)
        create_bookings(session, events, users, time_slots)

        # Print summary
        print_summary(session)

    print("\n✅ Seeding completed successfully!")
    print("🚀 You can now start your API server and test with the seeded data.\n")


if __name__ == "__main__":
    main()
