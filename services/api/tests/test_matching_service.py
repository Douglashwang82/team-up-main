import pytest
from datetime import date, time, datetime, timedelta
from app.models import Ticket, Event, User, Venue, Notification
from app.services.matching_service import process_ticket
from app.core.constants import SYSTEM_USER_ID

# Note: db, user, and user2 fixtures are provided by conftest.py

def test_create_ticket(db, user, venue):
    ticket = Ticket(
        user_id=user.id,
        date=date.today() + timedelta(days=1),
        start_time=time(10, 0),
        duration_minutes=60,
        sport_type="basketball",
        intensity="Medium",
        venue_ids=[venue.id]
    )
    db.add(ticket)
    db.commit()
    assert ticket.id is not None
    assert ticket.status == "open"

def test_matching_service_create_event(db, user, user2, venue):
    # Create and process first ticket (should remain open - no matches)
    ticket1 = Ticket(
        user_id=user.id,
        date=date.today() + timedelta(days=1),
        start_time=time(10, 0),
        duration_minutes=60,
        sport_type="tennis",
        intensity="Medium",
        venue_ids=[venue.id]
    )
    db.add(ticket1)
    db.commit()
    db.refresh(ticket1)

    # Process first ticket (no match yet)
    process_ticket(db, ticket1)
    db.refresh(ticket1)
    assert ticket1.status == "open"

    # Create second matching ticket
    ticket2 = Ticket(
        user_id=user2.id,
        date=date.today() + timedelta(days=1),
        start_time=time(10, 0),
        duration_minutes=60,
        sport_type="tennis",
        intensity="Medium",
        venue_ids=[venue.id]
    )
    db.add(ticket2)
    db.commit()
    db.refresh(ticket2)

    # Process second ticket (should match with first)
    process_ticket(db, ticket2)
    
    db.refresh(ticket1)
    db.refresh(ticket2)
    
    assert ticket1.status == "matched"
    assert ticket2.status == "matched"
    
    # Check if event was created
    event = db.query(Event).filter(Event.title.like("%Match%")).first()
    assert event is not None
    assert event.status == "open"
    assert event.owner_user_id == SYSTEM_USER_ID
    
    # Check notifications
    notif1 = db.query(Notification).filter(Notification.user_id == user.id).first()
    notif2 = db.query(Notification).filter(Notification.user_id == user2.id).first()
    
    assert notif1 is not None
    assert "Match found" in notif1.message
    assert notif2 is not None
