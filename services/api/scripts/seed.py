#!/usr/bin/env python3
"""
Comprehensive seed script for TeamUp Sports Meetup API
Creates sample data for all tables in the database
"""

from passlib.hash import bcrypt
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.db import SessionLocal
from app.models.user import User
from app.models.venue import Venue, Court, CourtSportType, VenueTimeslot, CourtTimeslot
from app.models.booking import Booking
from app.models.event import Event
from app.models.participant import EventParticipant
from app.models.join_request import EventJoinRequest
from app.models.teamup import TeamUp
from app.models.teamup_participant import TeamUpParticipant
from app.models.teamup_join_request import TeamUpJoinRequest
from app.models.teamup_timeslot import TeamUpTimeslot
from app.models.teamup_booking import TeamUpBooking
from app.models.booking_assignment import BookingAssignment
from app.models.event_teamup import EventTeamUp
from app.core.security import gen_invite_token
from app.core.types import BookingStatus, PaymentStatus, Visibility, EventStatus, joinRequestStatus


def create_users(session: Session):
    """Create sample users"""
    users_data = [
        {
            "email": "owner@example.com",
            "password": "password123",
            "display_name": "John Owner",
            "phone": "+1-555-0101"
        },
        {
            "email": "player1@example.com", 
            "password": "password123",
            "display_name": "Alice Player",
            "phone": "+1-555-0102"
        },
        {
            "email": "player2@example.com",
            "password": "password123", 
            "display_name": "Bob Player",
            "phone": "+1-555-0103"
        },
        {
            "email": "player3@example.com",
            "password": "password123",
            "display_name": "Carol Player", 
            "phone": "+1-555-0104"
        },
        {
            "email": "guest@example.com",
            "password": "password123",
            "display_name": "Guest User",
            "phone": "+1-555-0105"
        }
    ]
    
    users = []
    for user_data in users_data:
        existing_user = session.query(User).filter_by(email=user_data["email"]).first()
        if not existing_user:
            user = User(
                id=uuid.uuid4(),
                email=user_data["email"],
                password_hash=bcrypt.hash(user_data["password"]),
                display_name=user_data["display_name"],
                phone=user_data["phone"]
            )
            session.add(user)
            users.append(user)
        else:
            users.append(existing_user)
    
    session.commit()
    for user in users:
        session.refresh(user)
    
    print(f"✅ Created {len(users)} users")
    return users


def create_venues_and_courts(session: Session):
    """Create sample venues with courts and timeslots"""
    venues_data = [
        {
            "name": "Downtown Sports Center",
            "address": "123 Main St, Downtown",
            "city": "Dallas",
            "lat": 32.7767,
            "lng": -96.7970,
            "courts": [
                {
                    "name": "Court A - Basketball",
                    "sport_types": ["basketball"],
                    "timeslots": [
                        {"start_hour": 9, "duration": 2, "price": 1500},
                        {"start_hour": 11, "duration": 2, "price": 1500},
                        {"start_hour": 14, "duration": 2, "price": 1800},
                        {"start_hour": 16, "duration": 2, "price": 1800},
                        {"start_hour": 19, "duration": 2, "price": 2000},
                    ]
                },
                {
                    "name": "Court B - Basketball", 
                    "sport_types": ["basketball"],
                    "timeslots": [
                        {"start_hour": 10, "duration": 2, "price": 1500},
                        {"start_hour": 13, "duration": 2, "price": 1500},
                        {"start_hour": 15, "duration": 2, "price": 1800},
                        {"start_hour": 18, "duration": 2, "price": 2000},
                    ]
                },
                {
                    "name": "Court C - Multi-sport",
                    "sport_types": ["basketball", "volleyball", "badminton"],
                    "timeslots": [
                        {"start_hour": 8, "duration": 2, "price": 1200},
                        {"start_hour": 12, "duration": 2, "price": 1200},
                        {"start_hour": 17, "duration": 2, "price": 1500},
                    ]
                }
            ]
        },
        {
            "name": "Northside Athletic Club",
            "address": "456 Oak Ave, Northside", 
            "city": "Dallas",
            "lat": 32.8500,
            "lng": -96.8000,
            "courts": [
                {
                    "name": "Tennis Court 1",
                    "sport_types": ["tennis"],
                    "timeslots": [
                        {"start_hour": 7, "duration": 1, "price": 2500},
                        {"start_hour": 9, "duration": 1, "price": 2500},
                        {"start_hour": 11, "duration": 1, "price": 2500},
                        {"start_hour": 16, "duration": 1, "price": 3000},
                        {"start_hour": 18, "duration": 1, "price": 3000},
                    ]
                },
                {
                    "name": "Tennis Court 2",
                    "sport_types": ["tennis"],
                    "timeslots": [
                        {"start_hour": 8, "duration": 1, "price": 2500},
                        {"start_hour": 10, "duration": 1, "price": 2500},
                        {"start_hour": 15, "duration": 1, "price": 3000},
                        {"start_hour": 17, "duration": 1, "price": 3000},
                    ]
                }
            ]
        },
        {
            "name": "Southside Recreation Center",
            "address": "789 Pine St, Southside",
            "city": "Dallas", 
            "lat": 32.7000,
            "lng": -96.8000,
            "courts": [
                {
                    "name": "Soccer Field A",
                    "sport_types": ["soccer", "football"],
                    "timeslots": [
                        {"start_hour": 9, "duration": 2, "price": 3000},
                        {"start_hour": 14, "duration": 2, "price": 3000},
                        {"start_hour": 19, "duration": 2, "price": 3500},
                    ]
                },
                {
                    "name": "Volleyball Court",
                    "sport_types": ["volleyball"],
                    "timeslots": [
                        {"start_hour": 10, "duration": 2, "price": 1000},
                        {"start_hour": 13, "duration": 2, "price": 1000},
                        {"start_hour": 16, "duration": 2, "price": 1200},
                        {"start_hour": 20, "duration": 2, "price": 1200},
                    ]
                }
            ]
        }
    ]
    
    venues = []
    courts = []
    timeslots = []
    
    now = datetime.now(timezone.utc)
    
    for venue_data in venues_data:
        # Create venue
        venue = Venue(
            id=uuid.uuid4(),
            name=venue_data["name"],
            address=venue_data["address"],
            city=venue_data["city"],
            geo_point=func.ST_GeomFromText(f'POINT({venue_data["lng"]} {venue_data["lat"]})', 4326),
            contact_phone="+1-555-0000",
            partner_code=f"VENUE_{len(venues)+1:03d}"
        )
        session.add(venue)
        venues.append(venue)
        
        # Create courts for this venue
        for court_data in venue_data["courts"]:
            court = Court(
            id=uuid.uuid4(),
            venue_id=venue.id,
                name=court_data["name"]
            )
            session.add(court)
            courts.append(court)
            
            # Create sport types for this court
            for sport_type in court_data["sport_types"]:
                court_sport = CourtSportType(
                    id=uuid.uuid4(),
                    court_id=court.id,
                    sport_type=sport_type
                )
                session.add(court_sport)
            
            # Create timeslots for this court (next 7 days)
            for day_offset in range(7):
                for timeslot_data in court_data["timeslots"]:
                    start_time = now + timedelta(days=day_offset, hours=timeslot_data["start_hour"])
                    end_time = start_time + timedelta(hours=timeslot_data["duration"])
                    
                    court_timeslot = CourtTimeslot(
            id=uuid.uuid4(),
                        court_id=court.id,
                        starts_at=start_time,
                        ends_at=end_time,
                        price_cents=timeslot_data["price"],
            currency="USD",
                        is_bookable=True
                    )
                    session.add(court_timeslot)
                    timeslots.append(court_timeslot)
    
    session.commit()
    for venue in venues:
        session.refresh(venue)
    for court in courts:
        session.refresh(court)
    for timeslot in timeslots:
        session.refresh(timeslot)
    
    print(f"✅ Created {len(venues)} venues, {len(courts)} courts, {len(timeslots)} timeslots")
    return venues, courts, timeslots


def create_events(session: Session, users: list, timeslots: list):
    """Create sample events with booking assignments and TeamUp relationships"""
    events = []
    participants = []
    join_requests = []
    booking_assignments = []
    event_teamups = []
    
    # Create some bookings first
    bookings = []
    for i, timeslot in enumerate(timeslots[:5]):  # Use first 5 timeslots
        booking = Booking(
            id=uuid.uuid4(),
            owner_user_id=users[0].id,  # Booking owner
            venue_id=timeslot.court.venue_id,
            timeslot_id=timeslot.id,
            status=BookingStatus.confirmed.value,
            payment_status=PaymentStatus.succeeded.value
        )
        session.add(booking)
        bookings.append(booking)
    
    session.commit()
    for booking in bookings:
        session.refresh(booking)
    
    # Create events
    event_data = [
        {
            "title": "Morning Basketball Pickup",
            "description": "Casual morning basketball game for all skill levels",
            "sport_type": "basketball",
            "visibility": Visibility.public.value,
            "capacity": 10,
            "join_review_required": False
        },
        {
            "title": "Tennis Tournament Practice",
            "description": "Practice session for upcoming tournament",
            "sport_type": "tennis", 
            "visibility": Visibility.invite_only.value,
            "capacity": 4,
            "join_review_required": True
        },
        {
            "title": "Soccer League Match",
            "description": "Weekly league match - bring your A game!",
            "sport_type": "soccer",
            "visibility": Visibility.public.value,
            "capacity": 22,
            "join_review_required": False
        },
        {
            "title": "Private Volleyball Session",
            "description": "Private session for experienced players only",
            "sport_type": "volleyball",
            "visibility": Visibility.private.value,
            "capacity": 12,
            "join_review_required": True
        },
        {
            "title": "Badminton Doubles Tournament",
            "description": "Competitive doubles tournament",
            "sport_type": "badminton",
            "visibility": Visibility.public.value,
            "capacity": 16,
            "join_review_required": False
        }
    ]
    
    for i, (booking, event_info) in enumerate(zip(bookings, event_data)):
        timeslot = next(ts for ts in timeslots if ts.id == booking.timeslot_id)
        
        event = Event(
            id=uuid.uuid4(),
            title=event_info["title"],
            description=event_info["description"],
            sport_type=event_info["sport_type"],
            starts_at=timeslot.starts_at,
            ends_at=timeslot.ends_at,
            city=timeslot.court.venue.city,
            capacity=event_info["capacity"],
            booking_id=booking.id,
            owner_user_id=users[0].id,
            visibility=event_info["visibility"],
            invite_token=gen_invite_token() if event_info["visibility"] == Visibility.invite_only.value else None,
            join_review_required=event_info["join_review_required"],
            status=EventStatus.open.value
        )
        session.add(event)
        events.append(event)
        
        # Create booking assignment for this event
        booking_assignment = BookingAssignment(
            id=uuid.uuid4(),
            booking_id=booking.id,
            event_id=event.id,
            assignment_type="event",
            is_primary=True,
            priority=1,
            assigned_by_user_id=users[0].id,
            assignment_reason=f"Assigned to event: {event_info['title']}",
            status="active"
        )
        session.add(booking_assignment)
        booking_assignments.append(booking_assignment)
        
        # Add owner as participant
        owner_participant = EventParticipant(
            id=uuid.uuid4(),
            event_id=event.id,
            user_id=users[0].id,
            role="owner",
            display_name=users[0].display_name,
            email=users[0].email,
            phone=users[0].phone
        )
        session.add(owner_participant)
        participants.append(owner_participant)
        
        # Add some other participants
        for j in range(1, min(4, len(users))):
            participant = EventParticipant(
                id=uuid.uuid4(),
                event_id=event.id,
                user_id=users[j].id,
                role="member",
                display_name=users[j].display_name,
                email=users[j].email,
                phone=users[j].phone
            )
            session.add(participant)
            participants.append(participant)
        
        # Create some join requests for events that require review
        if event_info["join_review_required"]:
            join_request = EventJoinRequest(
                id=uuid.uuid4(),
            event_id=event.id,
                applicant_user_id=users[-1].id,  # Guest user
                applicant_name=users[-1].display_name,
                applicant_email=users[-1].email,
                applicant_phone=users[-1].phone,
                message="I'd love to join this event!",
                status=joinRequestStatus.submitted.value
            )
                session.add(join_request)
                join_requests.append(join_request)
    
    session.commit()
    for event in events:
        session.refresh(event)
    
    print(f"✅ Created {len(events)} events, {len(participants)} participants, {len(join_requests)} join requests, {len(booking_assignments)} booking assignments, {len(event_teamups)} event-teamup relationships")
    return events, participants, join_requests, booking_assignments, event_teamups


def create_teamups(session: Session, users: list, timeslots: list):
    """Create sample teamups with many-to-many timeslot and booking relationships"""
    teamups = []
    teamup_participants = []
    teamup_join_requests = []
    teamup_timeslots = []
    teamup_bookings = []
    teamup_booking_assignments = []
    
    # Use timeslots that don't have events yet
    available_timeslots = timeslots[5:15]  # Skip first 5 that have events
    
    teamup_data = [
        {
            "title": "Weekend Basketball League",
            "description": "Looking for players to form a team for the weekend league",
            "sport_type": "basketball",
            "min_participants": 5,
            "max_participants": 10,
            "deadline_hours": 48,
            "preferred_timeslots": 1,  # Number of preferred timeslots
            "alternative_timeslots": 2  # Number of alternative timeslots
        },
        {
            "title": "Tennis Doubles Partners",
            "description": "Need a doubles partner for upcoming tournament",
            "sport_type": "tennis",
            "min_participants": 2,
            "max_participants": 4,
            "deadline_hours": 24,
            "preferred_timeslots": 1,
            "alternative_timeslots": 1
        },
        {
            "title": "Soccer Team Formation",
            "description": "Forming a new soccer team for the season",
            "sport_type": "soccer",
            "min_participants": 8,
            "max_participants": 22,
            "deadline_hours": 72,
            "preferred_timeslots": 2,
            "alternative_timeslots": 3
        },
        {
            "title": "Volleyball Beach Tournament",
            "description": "Beach volleyball tournament team formation",
            "sport_type": "volleyball",
            "min_participants": 6,
            "max_participants": 12,
            "deadline_hours": 36,
            "preferred_timeslots": 1,
            "alternative_timeslots": 2
        },
        {
            "title": "Badminton Mixed Doubles",
            "description": "Looking for mixed doubles partners",
            "sport_type": "badminton",
            "min_participants": 4,
            "max_participants": 8,
            "deadline_hours": 12,
            "preferred_timeslots": 1,
            "alternative_timeslots": 1
        }
    ]
    
    for i, teamup_info in enumerate(teamup_data):
        deadline = datetime.now(timezone.utc) + timedelta(hours=teamup_info["deadline_hours"])
        
        # Create TeamUp without court_timeslot_id (using new many-to-many relationship)
        teamup = TeamUp(
            id=uuid.uuid4(),
            court_timeslot_id=None,  # Legacy field, now nullable
            title=teamup_info["title"],
            description=teamup_info["description"],
            owner_user_id=users[i % len(users)].id,
            min_participants=teamup_info["min_participants"],
            max_participants=teamup_info["max_participants"],
            deadline=deadline,
            sport_type=teamup_info["sport_type"],
            status="open"
        )
        session.add(teamup)
        teamups.append(teamup)
        
        # Add preferred timeslots
        preferred_count = teamup_info["preferred_timeslots"]
        for j in range(preferred_count):
            if i * 3 + j < len(available_timeslots):
                timeslot = available_timeslots[i * 3 + j]
                teamup_timeslot = TeamUpTimeslot(
                    id=uuid.uuid4(),
                    teamup_id=teamup.id,
                    court_timeslot_id=timeslot.id,
                    venue_timeslot_id=None,
                    is_preferred=True,
                    priority=j + 1
                )
                session.add(teamup_timeslot)
                teamup_timeslots.append(teamup_timeslot)
        
        # Add alternative timeslots
        alt_count = teamup_info["alternative_timeslots"]
        for j in range(alt_count):
            timeslot_idx = i * 3 + preferred_count + j
            if timeslot_idx < len(available_timeslots):
                timeslot = available_timeslots[timeslot_idx]
                teamup_timeslot = TeamUpTimeslot(
                    id=uuid.uuid4(),
                    teamup_id=teamup.id,
                    court_timeslot_id=timeslot.id,
                    venue_timeslot_id=None,
                    is_preferred=False,
                    priority=preferred_count + j + 1
                )
                session.add(teamup_timeslot)
                teamup_timeslots.append(teamup_timeslot)
        
        # Add owner as participant
        owner_participant = TeamUpParticipant(
            id=uuid.uuid4(),
            teamup_id=teamup.id,
            user_id=users[i % len(users)].id,
            role="owner",
            display_name=users[i % len(users)].display_name,
            email=users[i % len(users)].email,
            phone=users[i % len(users)].phone
        )
        session.add(owner_participant)
        teamup_participants.append(owner_participant)
        
        # Add some existing participants
        for j in range(1, min(3, len(users))):
            if j != i % len(users):  # Don't add owner twice
                participant = TeamUpParticipant(
                    id=uuid.uuid4(),
                    teamup_id=teamup.id,
                    user_id=users[j].id,
                    role="member",
                    display_name=users[j].display_name,
                    email=users[j].email,
                    phone=users[j].phone
                )
                session.add(participant)
                teamup_participants.append(participant)
        
        # Create some join requests
        for k in range(2):  # 2 join requests per teamup
            applicant_idx = (i + k + 2) % len(users)
            if applicant_idx != i % len(users):  # Don't add owner as applicant
                join_request = TeamUpJoinRequest(
                    id=uuid.uuid4(),
                    teamup_id=teamup.id,
                    applicant_user_id=users[applicant_idx].id,
                    applicant_name=users[applicant_idx].display_name,
                    applicant_email=users[applicant_idx].email,
                    applicant_phone=users[applicant_idx].phone,
                    message=f"I'm interested in joining {teamup_info['title']}!",
                    status=joinRequestStatus.submitted.value
                )
                session.add(join_request)
                teamup_join_requests.append(join_request)
        
        # Create bookings for this TeamUp (simulate multiple booking scenarios)
        booking_count = min(2, len(available_timeslots) - i * 3)  # 1-2 bookings per TeamUp
        for j in range(booking_count):
            timeslot_idx = i * 3 + j
            if timeslot_idx < len(available_timeslots):
                timeslot = available_timeslots[timeslot_idx]
                
                # Create a booking
                booking = Booking(
                    id=uuid.uuid4(),
                    owner_user_id=users[i % len(users)].id,  # Booking owner
                    venue_id=timeslot.court.venue_id,
                    timeslot_id=timeslot.id,
                    status=BookingStatus.confirmed.value,
                    payment_status=PaymentStatus.succeeded.value
                )
                session.add(booking)
                
                # Create booking assignment for TeamUp
                booking_assignment = BookingAssignment(
                    id=uuid.uuid4(),
                    booking_id=booking.id,
                    teamup_id=teamup.id,
                    assignment_type="teamup",
                    is_primary=(j == 0),  # First booking is primary
                    priority=j + 1,
                    assigned_by_user_id=users[i % len(users)].id,
                    assignment_reason=f"Assigned to TeamUp: {teamup_info['title']}",
                    status="active"
                )
                session.add(booking_assignment)
                teamup_booking_assignments.append(booking_assignment)
                
                # Legacy TeamUpBooking relationship (for backward compatibility)
                teamup_booking = TeamUpBooking(
                    id=uuid.uuid4(),
                    teamup_id=teamup.id,
                    booking_id=booking.id,
                    is_primary=(j == 0),  # First booking is primary
                    priority=j + 1,
                    contribution_amount_cents=timeslot.price_cents // (booking_count + 1) if timeslot.price_cents else None,
                    contribution_percentage=100.0 / (booking_count + 1),
                    status="active"
                )
                session.add(teamup_booking)
                teamup_bookings.append(teamup_booking)
    
    session.commit()
    for teamup in teamups:
        session.refresh(teamup)
    
    print(f"✅ Created {len(teamups)} teamups, {len(teamup_participants)} participants, {len(teamup_join_requests)} join requests, {len(teamup_timeslots)} timeslot relationships, {len(teamup_bookings)} legacy booking relationships, {len(teamup_booking_assignments)} booking assignments")
    return teamups, teamup_participants, teamup_join_requests, teamup_timeslots, teamup_bookings, teamup_booking_assignments


def create_event_teamup_relationships(session: Session, events: list, teamups: list):
    """Create Event-TeamUp many-to-many relationships"""
    event_teamup_relationships = []
    
    # Create relationships between events and teamups with matching sport types
    for i, event in enumerate(events):
        # Find teamups with matching sport type
        matching_teamups = [t for t in teamups if t.sport_type == event.sport_type]
        
        # Create relationships with up to 2 matching teamups per event
        for j, teamup in enumerate(matching_teamups[:2]):
            relationship_type = "organizer" if j == 0 else "participant"
            
            event_teamup = EventTeamUp(
                id=uuid.uuid4(),
                event_id=event.id,
                teamup_id=teamup.id,
                is_primary=(j == 0),  # First relationship is primary
                priority=j + 1,
                relationship_type=relationship_type,
                contribution_percentage=50.0 if j == 0 else 25.0,
                status="active"
            )
            session.add(event_teamup)
            event_teamup_relationships.append(event_teamup)
    
    # Create additional cross-sport relationships for demonstration
    for i in range(min(3, len(events), len(teamups))):
        event = events[i % len(events)]
        teamup = teamups[i % len(teamups)]
        
        # Skip if already related
        if any(et.event_id == event.id and et.teamup_id == teamup.id for et in event_teamup_relationships):
            continue
        
        event_teamup = EventTeamUp(
            id=uuid.uuid4(),
            event_id=event.id,
            teamup_id=teamup.id,
            is_primary=False,
            priority=3,
            relationship_type="partner",
            contribution_percentage=15.0,
            status="active"
        )
        session.add(event_teamup)
        event_teamup_relationships.append(event_teamup)
    
    session.commit()
    for relationship in event_teamup_relationships:
        session.refresh(relationship)
    
    print(f"✅ Created {len(event_teamup_relationships)} Event-TeamUp relationships")
    return event_teamup_relationships


def main():
    """Main seed function"""
    print("🌱 Starting comprehensive database seeding...")
    
    with SessionLocal() as session:
        try:
            # Create all sample data
            users = create_users(session)
            venues, courts, timeslots = create_venues_and_courts(session)
            events, participants, join_requests, event_booking_assignments, event_teamups = create_events(session, users, timeslots)
            teamups, teamup_participants, teamup_join_requests, teamup_timeslots, teamup_bookings, teamup_booking_assignments = create_teamups(session, users, timeslots)
            
            # Create Event-TeamUp relationships
            event_teamup_relationships = create_event_teamup_relationships(session, events, teamups)
            
            print("\n🎉 Seeding completed successfully!")
            print(f"📊 Summary:")
            print(f"   👥 Users: {len(users)}")
            print(f"   🏢 Venues: {len(venues)}")
            print(f"   🏟️  Courts: {len(courts)}")
            print(f"   ⏰ Timeslots: {len(timeslots)}")
            print(f"   🎯 Events: {len(events)}")
            print(f"   👤 Event Participants: {len(participants)}")
            print(f"   📝 Event Join Requests: {len(join_requests)}")
            print(f"   📅 Event Booking Assignments: {len(event_booking_assignments)}")
            print(f"   🤝 Event-TeamUp Relationships: {len(event_teamups)}")
            print(f"   🤝 TeamUps: {len(teamups)}")
            print(f"   👥 TeamUp Participants: {len(teamup_participants)}")
            print(f"   📋 TeamUp Join Requests: {len(teamup_join_requests)}")
            print(f"   ⏰ TeamUp-Timeslot Relationships: {len(teamup_timeslots)}")
            print(f"   📅 TeamUp Legacy Booking Relationships: {len(teamup_bookings)}")
            print(f"   📅 TeamUp Booking Assignments: {len(teamup_booking_assignments)}")
            print(f"   🔗 Event-TeamUp Relationships: {len(event_teamup_relationships)}")
            
            print(f"\n🔑 Test Credentials:")
            for user in users:
                print(f"   📧 {user.email} / password: password123")
            
            if events:
                invite_event = next((e for e in events if e.invite_token), None)
                if invite_event:
                    print(f"\n🎫 Invite Token for '{invite_event.title}': {invite_event.invite_token}")
            
        except Exception as e:
            session.rollback()
            print(f"❌ Error during seeding: {e}")
            raise


if __name__ == "__main__":
    main()