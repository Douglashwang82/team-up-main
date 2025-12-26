import pytest
from flask import Flask
from dotenv import load_dotenv
import os

# Load .env file before importing app modules
load_dotenv()

from app.core.db import Base, engine, SessionLocal
from app.models import User, Venue, Court, TimeSlot, Event, Booking, Notification, Ticket
from passlib.hash import bcrypt
from datetime import datetime, timedelta, time, date
from uuid import UUID
import jwt


@pytest.fixture(scope="session")
def app():
    """Create and configure a test Flask app"""
    from app.core.config import settings

    # Create Flask app for testing
    test_app = Flask(__name__)
    test_app.config["TESTING"] = True
    test_app.config["JWT_SECRET"] = settings.JWT_SECRET

    # Register blueprints
    from app.routes.health import bp as health_bp
    from app.routes.auth import bp as auth_bp
    from app.routes.venues import bp as venues_bp
    from app.routes.tickets import bp as tickets_bp
    from app.routes.bookings import bp as bookings_bp
    from app.routes.notifications import bp as notifications_bp
    from app.routes.events import bp as events_bp

    test_app.register_blueprint(health_bp)
    test_app.register_blueprint(auth_bp, url_prefix="/auth")
    test_app.register_blueprint(venues_bp, url_prefix="/venues")
    test_app.register_blueprint(tickets_bp, url_prefix="/tickets")
    test_app.register_blueprint(bookings_bp, url_prefix="/bookings")
    test_app.register_blueprint(notifications_bp, url_prefix="/notifications")
    test_app.register_blueprint(events_bp, url_prefix="/events")

    return test_app


@pytest.fixture(scope="session")
def client(app):
    """Create a test client for the app"""
    return app.test_client()


@pytest.fixture(scope="function")
def db():
    """Create a database session for testing"""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create a session
    session = SessionLocal()

    # Insert system user
    from app.core.constants import SYSTEM_USER_ID, SYSTEM_USER_EMAIL, SYSTEM_USER_DISPLAY_NAME, SYSTEM_USER_PASSWORD_HASH
    
    system_user = User(
        id=SYSTEM_USER_ID,
        email=SYSTEM_USER_EMAIL,
        password_hash=SYSTEM_USER_PASSWORD_HASH,
        display_name=SYSTEM_USER_DISPLAY_NAME
    )
    session.add(system_user)
    session.commit()

    yield session

    # Cleanup
    session.close()
    # Drop all tables after each test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def user(db):
    """Create a test user"""
    user = User(
        email="test@example.com",
        password_hash=bcrypt.hash("password123"),
        display_name="Test User",
        phone="555-1234"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def user2(db):
    """Create a second test user"""
    user = User(
        email="test2@example.com",
        password_hash=bcrypt.hash("password123"),
        display_name="Test User 2",
        phone="555-5678"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(app, user):
    """Generate auth headers with valid JWT token"""
    token = jwt.encode(
        {"sub": str(user.id), "exp": datetime.utcnow() + timedelta(hours=1)},
        app.config["JWT_SECRET"],
        algorithm="HS256"
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_user2(app, user2):
    """Generate auth headers for second user"""
    token = jwt.encode(
        {"sub": str(user2.id), "exp": datetime.utcnow() + timedelta(hours=1)},
        app.config["JWT_SECRET"],
        algorithm="HS256"
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def venue(db):
    """Create a test venue with courts and time slots"""
    from geoalchemy2.elements import WKTElement

    venue = Venue(
        name="Test Basketball Court",
        address="123 Test St",
        city="Test City",
        geo_point=WKTElement('POINT(121.5654 25.0330)', srid=4326)
    )
    db.add(venue)
    db.flush()

    # Add a court
    court = Court(
        venue_id=venue.id,
        name="Court 1",
        sport_type="basketball"
    )
    db.add(court)
    db.flush()

    # Add a tennis court
    tennis_court = Court(
        venue_id=venue.id,
        name="Tennis Court 1",
        sport_type="tennis"
    )
    db.add(tennis_court)
    db.flush()

    # Add time slots
    now = datetime.utcnow()
    tomorrow = now + timedelta(days=1)
    start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)

    for i in range(5):
        slot_start = start_time + timedelta(hours=i)
        slot_end = slot_start + timedelta(hours=1)
        
        # Basketball slots
        time_slot = TimeSlot(
            court_id=court.id,
            starts_at=slot_start,
            ends_at=slot_end,
            price_cents=5000,
            currency="USD",
            is_bookable=True
        )
        db.add(time_slot)
        
        # Tennis slots
        tennis_slot = TimeSlot(
            court_id=tennis_court.id,
            starts_at=slot_start,
            ends_at=slot_end,
            price_cents=3000,
            currency="USD",
            is_bookable=True
        )
        db.add(tennis_slot)

    db.commit()
    db.refresh(venue)
    return venue


@pytest.fixture
def event(db, user):
    """Create a test event"""
    from app.models.event_participant import EventParticipant

    event = Event(
        title="Test Basketball Game",
        description="A test event",
        owner_user_id=user.id,
        max_participants=8,
        visibility="public",
        duration_type="temporary",
        status="open"
    )
    db.add(event)
    db.flush()

    # Add owner as participant
    participant = EventParticipant(
        event_id=event.id,
        user_id=user.id,
        role="owner",
        display_name=user.display_name,
        email=user.email,
        phone=user.phone
    )
    db.add(participant)
    db.commit()
    db.refresh(event)
    return event


@pytest.fixture
def booking(db, user, venue):
    """Create a test booking"""
    # Get first available time slot
    time_slot = db.query(TimeSlot).filter(TimeSlot.court_id.in_(
        db.query(Court.id).filter(Court.venue_id == venue.id)
    )).first()

    booking = Booking(
        owner_user_id=user.id,
        time_slot_id=time_slot.id,
        status="pending",
        payment_status="none"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@pytest.fixture
def notification(db, user):
    """Create a test notification"""
    notification = Notification(
        user_id=user.id,
        message="Test notification",
        type="general",
        is_read=False,
        related_event_ids=[]
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@pytest.fixture
def ticket(db, user):
    """Create a test ticket"""
    ticket = Ticket(
        user_id=user.id,
        date=date.today() + timedelta(days=1),
        start_time=time(18, 0),
        duration_minutes=60,
        sport_type="basketball",
        intensity="Medium",
        venue_ids=None,
        price_min=None,
        price_max=None,
        currency="USD"
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket
