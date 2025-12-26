import logging
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_
import sqlalchemy as sa
from datetime import datetime

from app.models.ticket import Ticket
from app.models.event import Event
from app.models.notification import Notification
from app.models.user import User
from app.models.venue import Venue, Court, TimeSlot
from app.models.booking import Booking
from app.core.constants import SYSTEM_USER_ID

logger = logging.getLogger(__name__)

def process_ticket(db: Session, ticket: Ticket):
    """
    Main entry point for processing a new ticket.
    1. Try to match with existing Open Events.
    2. If no event match, try to match with other Open Tickets to create a new Event.
    """
    logger.info(f"Processing ticket {ticket.id} for user {ticket.user_id}")
    
    # 1. Search for existing Open Events
    matched_events = find_existing_events(db, ticket)
    if matched_events:
        print("Found existing events for ticket", ticket.id)
        match_with_events(db, ticket, matched_events)
        return

    # 2. Search for matching tickets to create a new event
    match_with_other_tickets(db, ticket)

def find_existing_events(db: Session, ticket: Ticket) -> list[Event]:
    """
    Find existing Event events that match the ticket criteria.
    """
    # Basic criteria: Sport, Status=Open, Visibility=Public
    # We look for Events that have a Booking on the same Date/Time 
    # AND the Court's sport_type matches.
    
    # Join Event -> Booking -> TimeSlot -> Court
    # Check Court.sport_type == ticket.sport_type
    # Check TimeSlot.starts_at date and time match ticket preferences
    
    # Construct DateTime range from ticket
    ticket_start_dt = datetime.combine(ticket.date, ticket.start_time)
    
    stmt = (
        select(Event)
        .join(Booking, Event.bookings)
        .join(TimeSlot, Booking.time_slot)
        .join(Court, TimeSlot.court)
        .where(
            Event.status == 'open',
            Event.visibility == 'public',
            Court.sport_type == ticket.sport_type,
        )
    )
    
    events = db.scalars(stmt).all()
    
    matches = []
    for event in events:
        # Check time
        # Assuming event has one main booking for simplicity of this matching logic
        if not event.bookings:
            continue
            
        booking = event.bookings[0]
        ts = booking.time_slot
        
        # Check date
        if ts.starts_at.date() != ticket.date:
            continue
            
        # Check time (within 1 hour)
        time_diff = (ts.starts_at.time().hour * 60 + ts.starts_at.time().minute) - \
                    (ticket.start_time.hour * 60 + ticket.start_time.minute)
        
        if abs(time_diff) > 60:
            continue
            
        # Check participants
        if len(event.participants) >= event.max_participants:
            continue
            
        matches.append(event)
        
    return matches

def match_with_events(db: Session, ticket: Ticket, events: list[Event]):
    """
    Match a ticket with existing events.
    """
    logger.info(f"Matching ticket {ticket.id} with events {[e.id for e in events]}")
    
    # Update ticket status
    ticket.status = 'matched'
    
    # Create a single notification with all matched event IDs
    if events:
        event_titles = ", ".join([e.title for e in events])
        notification = Notification(
            user_id=ticket.user_id,
            message=f"We found {len(events)} match(es)! Events: {event_titles}",
            type="match_found",
            related_event_ids=[e.id for e in events]
        )
        db.add(notification)
    
    # Optionally auto-join or send invite?
    # Requirement: "Confirm join" (Notify user, confirm join)
    # So we just notify.
    
    db.commit()

def match_with_other_tickets(db: Session, ticket: Ticket):
    """
    Find other open tickets to form a new Event.
    Requires sport-specific minimum players and available timeslots.
    """
    # Define minimum players required per sport
    MIN_PLAYERS = {
        'basketball': 5,
        'tennis': 2,
        'badminton': 2,
        'soccer': 5,
        'volleyball': 4,
    }
    
    # Get minimum required for this sport (default to 2)
    min_required = MIN_PLAYERS.get(ticket.sport_type.lower(), 2)
    
    # Criteria: Same Date, Similar Time, Same Sport, Same Intensity
    query = select(Ticket).where(
        Ticket.id != ticket.id,
        Ticket.status == 'open',
        Ticket.date == ticket.date,
        Ticket.sport_type == ticket.sport_type,
        Ticket.intensity == ticket.intensity,
    )
    
    candidates = db.scalars(query).all()
    
    matches = []
    for candidate in candidates:
        # Check time overlap/proximity (within 1 hour)
        time_diff = (candidate.start_time.hour * 60 + candidate.start_time.minute) - \
                    (ticket.start_time.hour * 60 + ticket.start_time.minute)
        
        if abs(time_diff) > 60:
            continue
        
        # Check venue_id overlap (both tickets now have venue preferences)
        common_venues = set(ticket.venue_ids) & set(candidate.venue_ids)
        if not common_venues:
            # No common venue preferences - skip this candidate
            continue
        
        matches.append(candidate)
    
    # Check if we have enough players (including the primary ticket)
    total_players = len(matches) + 1
    
    if total_players < min_required:
        logger.info(f"Not enough players for {ticket.sport_type}: {total_players}/{min_required}")
        return
    
    # Check if there's an available timeslot
    available_timeslot = find_available_timeslot(db, ticket)
    
    if not available_timeslot:
        logger.warning(f"No available timeslot found for matched tickets (sport: {ticket.sport_type})")
        return
    
    # We have enough players and a timeslot - create the event!
    logger.info(f"Creating event for {total_players} players ({ticket.sport_type})")
    create_event_from_tickets(db, ticket, matches)

def create_event_from_tickets(db: Session, primary_ticket: Ticket, other_tickets: list[Ticket]):
    """
    Create a new Event from a group of tickets and automatically book a timeslot.
    """
    logger.info(f"Creating event for tickets {primary_ticket.id} and {[t.id for t in other_tickets]}")
    
    # 1. Find an available timeslot that matches the ticket criteria
    available_timeslot = find_available_timeslot(db, primary_ticket)
    
    if not available_timeslot:
        logger.warning(f"No available timeslot found for ticket {primary_ticket.id}")
        # Still create the event but without a booking
        # The owner can manually book later
    
    # 2. Create Event (owned by system user - all participants are equal)
    event = Event(
        title=f"🤖 {primary_ticket.sport_type.title()} Match",
        description=f"Auto-generated match for {primary_ticket.sport_type}. Created by Team-Up matching service.",
        owner_user_id=SYSTEM_USER_ID,  # System user owns auto-generated events
        max_participants=len(other_tickets) + 1 + 2,  # Add some buffer
        visibility='public',
        status='open'
    )
    db.add(event)
    db.flush() # Get ID
    
    # 3. Create booking if timeslot was found (owned by system user)
    if available_timeslot:
        booking = Booking(
            owner_user_id=SYSTEM_USER_ID,  # System user owns the booking
            time_slot_id=available_timeslot.id,
            event_id=event.id,
            status='confirmed',
            payment_status='none'
        )
        db.add(booking)
        logger.info(f"Created booking {booking.id} for event {event.id} at timeslot {available_timeslot.id}")
    
    # 4. Notify all users
    all_tickets = [primary_ticket] + other_tickets
    for t in all_tickets:
        t.status = 'matched'
        
        message = f"Match found! A new event has been created: {event.title}"
        if available_timeslot:
            message += f" at {available_timeslot.starts_at.strftime('%Y-%m-%d %H:%M')}"
        
        notification = Notification(
            user_id=t.user_id,
            message=message,
            type="event_created",
            related_event_ids=[event.id]
        )
        db.add(notification)
        
    db.commit()
    logger.info(f"Event {event.id} created successfully with {len(all_tickets)} participants")


def find_available_timeslot(db: Session, ticket: Ticket) -> TimeSlot | None:
    """
    Find an available timeslot that matches the ticket's preferences.
    Returns the first available timeslot or None if no match found.
    """
    ticket_start_dt = datetime.combine(ticket.date, ticket.start_time)
    
    # Build query for available timeslots
    stmt = (
        select(TimeSlot)
        .join(Court, TimeSlot.court)
        .outerjoin(Booking, TimeSlot.bookings)
        .where(
            # Match sport type
            Court.sport_type == ticket.sport_type,
            # Match date
            sa.func.date(TimeSlot.starts_at) == ticket.date,
            # Match time (within 1 hour)
            sa.func.abs(
                sa.func.extract('epoch', TimeSlot.starts_at - ticket_start_dt)
            ) <= 3600,
            # Is bookable
            TimeSlot.is_bookable == True,
            # No existing booking (available)
            Booking.id == None
        )
    )
    
    # Filter by venue preferences (now required)
    stmt = stmt.join(Venue, Court.venue).where(
        Venue.id.in_(ticket.venue_ids)
    )
    
    # Filter by price range if specified
    if ticket.price_min is not None:
        stmt = stmt.where(TimeSlot.price_cents >= ticket.price_min)
    if ticket.price_max is not None:
        stmt = stmt.where(TimeSlot.price_cents <= ticket.price_max)
    
    # Get first available timeslot
    result = db.execute(stmt).first()
    
    if result:
        logger.info(f"Found available timeslot {result[0].id} for ticket {ticket.id}")
        return result[0]
    
    logger.info(f"No available timeslot found for ticket {ticket.id}")
    return None