import pytest
from datetime import date, time, datetime, timedelta
from app.models import Ticket, TeamUp, User, Venue, Notification
from app.services.matching_service import MatchingService
from app.core.db import Base, engine, SessionLocal

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def user(db):
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def user2(db):
    user = User(email="test2@example.com", password_hash="hash", display_name="Test User 2")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

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
    # Create two matching tickets
    ticket1 = Ticket(
        user_id=user.id,
        date=date(2025, 11, 21),
        start_time=time(19, 0),
        duration_minutes=60,
        sport_type="tennis",
        intensity="Medium"
    )
    db.add(ticket1)
    
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
    
    service = MatchingService(db)
    
    # Process first ticket (no match yet)
    service.process_ticket(ticket1)
    db.refresh(ticket1)
    assert ticket1.status == "open"
    
    # Process second ticket (should match with first)
    service.process_ticket(ticket2)
    
    db.refresh(ticket1)
    db.refresh(ticket2)
    
    assert ticket1.status == "matched"
    assert ticket2.status == "matched"
    
    # Check if event was created
    event = db.query(TeamUp).filter(TeamUp.title.like("tennis Match%")).first()
    assert event is not None
    assert event.status == "open"
    
    # Check notifications
    notif1 = db.query(Notification).filter(Notification.user_id == user.id).first()
    notif2 = db.query(Notification).filter(Notification.user_id == user2.id).first()
    
    assert notif1 is not None
    assert "Match found" in notif1.message
    assert notif2 is not None
