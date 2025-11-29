import pytest
from datetime import date, time, datetime, timedelta
from app.models import Ticket, Event, User, Venue, Notification
from app.services.matching_service import process_ticket

# Note: db, user, and user2 fixtures are provided by conftest.py

def test_create_ticket(db, user):
    ticket = Ticket(
        user_id=user.id,
        date=date(2025, 11, 20),
        start_time=time(18, 0),
        duration_minutes=60,
        sport_type="basketball",
        intensity="Medium"
    )
    db.add(ticket)
    db.commit()
    assert ticket.id is not None
    assert ticket.status == "open"

def test_matching_service_create_event(db, user, user2):
    # Create and process first ticket (should remain open - no matches)
    ticket1 = Ticket(
        user_id=user.id,
        date=date(2025, 11, 21),
        start_time=time(19, 0),
        duration_minutes=60,
        sport_type="tennis",
        intensity="Medium"
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
        date=date(2025, 11, 21),
        start_time=time(19, 0),
        duration_minutes=60,
        sport_type="tennis",
        intensity="Medium"
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
    event = db.query(Event).filter(Event.title.like("tennis Match%")).first()
    assert event is not None
    assert event.status == "open"
    
    # Check notifications
    notif1 = db.query(Notification).filter(Notification.user_id == user.id).first()
    notif2 = db.query(Notification).filter(Notification.user_id == user2.id).first()
    
    assert notif1 is not None
    assert "Match found" in notif1.message
    assert notif2 is not None
