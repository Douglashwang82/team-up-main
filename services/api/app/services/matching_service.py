import logging
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_
from datetime import datetime

from app.models.ticket import Ticket
from app.models.teamup import TeamUp
from app.models.notification import Notification
from app.models.user import User
from app.models.venue import Venue, Court, TimeSlot
from app.models.booking import Booking

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
        match_with_events(db, ticket, matched_events)
        return

    # 2. Search for matching tickets to create a new event
    match_with_other_tickets(db, ticket)

def find_existing_events(db: Session, ticket: Ticket) -> list[TeamUp]:
    """
    Find existing TeamUp events that match the ticket criteria.
    """
    # Basic criteria: Sport, Status=Open, Visibility=Public
    # We look for TeamUps that have a Booking on the same Date/Time 
    # AND the Court's sport_type matches.
    
    # Join TeamUp -> Booking -> TimeSlot -> Court
    # Check Court.sport_type == ticket.sport_type
    # Check TimeSlot.starts_at date and time match ticket preferences
    
    # Construct DateTime range from ticket
    ticket_start_dt = datetime.combine(ticket.date, ticket.start_time)
    
    stmt = (
        select(TeamUp)
        .join(Booking, TeamUp.bookings)
        .join(TimeSlot, Booking.time_slot)
        .join(Court, TimeSlot.court)
        .where(
            TeamUp.status == 'open',
            TeamUp.visibility == 'public',
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

def match_with_events(db: Session, ticket: Ticket, events: list[TeamUp]):
    """
    Match a ticket with existing events.
    """
    logger.info(f"Matching ticket {ticket.id} with events {[e.id for e in events]}")
    
    # Update ticket status
    ticket.status = 'matched'
    
    # Create notification for user for EACH event
    for event in events:
        notification = Notification(
            user_id=ticket.user_id,
            message=f"We found a match! Join event: {event.title}",
            type="match_found",
            related_entity_id=event.id,
            related_entity_type="teamup"
        )
        db.add(notification)
    
    # Optionally auto-join or send invite?
    # Requirement: "Confirm join" (Notify user, confirm join)
    # So we just notify.
    
    db.commit()

def match_with_other_tickets(db: Session, ticket: Ticket):
    """
    Find other open tickets to form a new TeamUp.
    """
    # Criteria: Same Date, Similar Time, Same Sport, Same Intensity, Price overlap
    
    query = select(Ticket).where(
        Ticket.id != ticket.id,
        Ticket.status == 'open',
        Ticket.date == ticket.date,
        Ticket.sport_type == ticket.sport_type,
        Ticket.intensity == ticket.intensity,
        # Price overlap logic could be added here
    )
    
    candidates = db.scalars(query).all()
    
    matches = []
    for candidate in candidates:
        # Check time overlap/proximity
        time_diff = (candidate.start_time.hour * 60 + candidate.start_time.minute) - \
                    (ticket.start_time.hour * 60 + ticket.start_time.minute)
        
        if abs(time_diff) <= 60: # Within 1 hour
            matches.append(candidate)
    
    # Logic: If we have enough people? 
    # Requirement: "If results meet conditions, system automatically generates Event"
    # What is "meet conditions"? Usually min players.
    # Let's assume min 2 for now for MVP (e.g. Tennis, Badminton).
    
    if len(matches) >= 1: # Found at least 1 other person (total 2)
        create_event_from_tickets(db, ticket, matches)

def create_event_from_tickets(db: Session, primary_ticket: Ticket, other_tickets: list[Ticket]):
    """
    Create a new TeamUp event from a group of tickets.
    """
    logger.info(f"Creating event for tickets {primary_ticket.id} and {[t.id for t in other_tickets]}")
    
    # 1. Create Event
    # We need a venue. Use the primary ticket's preferred venue or a default?
    # For now, we won't actually book a venue (that's complex), just create the TeamUp intent.
    # Or we need to pick a venue from the intersection of venue_ids.
    
    event = TeamUp(
        title=f"{primary_ticket.sport_type} Match",
        description=f"Auto-generated match for {primary_ticket.sport_type}",
        owner_user_id=primary_ticket.user_id, # Assign primary as owner
        max_participants=len(other_tickets) + 1 + 2, # Add some buffer
        visibility='public',
        status='open'
    )
    db.add(event)
    db.flush() # Get ID
    
    # 2. Notify all users
    all_tickets = [primary_ticket] + other_tickets
    for t in all_tickets:
        t.status = 'matched'
        
        notification = Notification(
            user_id=t.user_id,
            message=f"Match found! A new event has been created: {event.title}",
            type="event_created",
            related_entity_id=event.id,
            related_entity_type="teamup"
        )
        db.add(notification)
        
    db.commit()