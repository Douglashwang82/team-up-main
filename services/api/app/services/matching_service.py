import logging
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_
from app.models import Ticket, TeamUp, Notification, User, Venue
from app.models.teamup import TeamUp
from datetime import datetime

logger = logging.getLogger(__name__)

class MatchingService:
    def __init__(self, db: Session):
        self.db = db

    def process_ticket(self, ticket: Ticket):
        """
        Main entry point for processing a new ticket.
        1. Try to match with existing Open Events.
        2. If no event match, try to match with other Open Tickets to create a new Event.
        """
        logger.info(f"Processing ticket {ticket.id} for user {ticket.user_id}")
        
        # 1. Search for existing Open Events
        matched_event = self.find_existing_event(ticket)
        if matched_event:
            self.match_with_event(ticket, matched_event)
            return

        # 2. Search for matching tickets to create a new event
        self.match_with_other_tickets(ticket)

    def find_existing_event(self, ticket: Ticket) -> TeamUp | None:
        """
        Find an existing TeamUp event that matches the ticket criteria.
        """
        # Basic criteria: Sport, Status=Open, Visibility=Public
        query = select(TeamUp).where(
            TeamUp.status == 'open',
            TeamUp.visibility == 'public',
            # We need to check if the event has a booking that matches the ticket's date/time
            # For MVP, let's assume we match based on description or title containing the sport? 
            # Or better, we should have sport_type on TeamUp. 
            # The current TeamUp model doesn't have sport_type explicitly, but Court has it.
            # Let's assume for now we check if there are any bookings for this TeamUp that match.
        )
        
        # Since TeamUp structure is a bit complex with Bookings and Courts, 
        # and the Ticket has specific Date/Time/Sport requirements.
        # We need to find a TeamUp that:
        # 1. Is for the same Sport (implied by venue/court)
        # 2. Is at the desired Date and Time (approximate)
        # 3. Has space (participants < max_participants)
        
        # This is complex without a direct link. 
        # Let's simplify: We look for TeamUps that have a Booking on the same Date/Time 
        # AND the Court's sport_type matches.
        
        # Join TeamUp -> Booking -> TimeSlot -> Court
        # Check Court.sport_type == ticket.sport_type
        # Check TimeSlot.starts_at date and time match ticket preferences
        
        # Note: Ticket has date (Date) and start_time (Time).
        # TimeSlot has starts_at (DateTime).
        
        # Construct DateTime range from ticket
        ticket_start_dt = datetime.combine(ticket.date, ticket.start_time)
        
        # Allow some buffer? For now, exact match on start time or within a window?
        # Let's say within 1 hour window? Or exact match?
        # Let's try exact match for simplicity first, or overlapping.
        
        # Actually, the requirement says "Date, Start Time, Duration".
        
        # Let's look for TeamUps.
        # We need to import Booking, TimeSlot, Court to join.
        from app.models import Booking, TimeSlot, Court
        
        stmt = (
            select(TeamUp)
            .join(Booking, TeamUp.bookings)
            .join(TimeSlot, Booking.time_slot)
            .join(Court, TimeSlot.court)
            .where(
                TeamUp.status == 'open',
                TeamUp.visibility == 'public',
                Court.sport_type == ticket.sport_type,
                # Check if TeamUp is not full
                # This requires counting participants. 
                # We can do a subquery or check in python.
                # Let's check in python for simplicity if volume is low.
            )
        )
        
        # Filter by time
        # TimeSlot.starts_at should be close to ticket_start_dt
        # Let's say +/- 30 mins
        # And duration should match?
        
        # For MVP, let's just match strictly on Date and Sport for now, then filter in Python.
        
        events = self.db.scalars(stmt).all()
        
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
                
            # Check intensity if stored on TeamUp? Not currently.
            
            # Check participants
            if len(event.participants) >= event.max_participants:
                continue
                
            return event
            
        return None

    def match_with_event(self, ticket: Ticket, event: TeamUp):
        """
        Match a ticket with an existing event.
        """
        logger.info(f"Matching ticket {ticket.id} with event {event.id}")
        
        # Update ticket status
        ticket.status = 'matched'
        
        # Create notification for user
        notification = Notification(
            user_id=ticket.user_id,
            message=f"We found a match! Join event: {event.title}",
            type="match_found",
            related_entity_id=event.id,
            related_entity_type="teamup"
        )
        self.db.add(notification)
        
        # Optionally auto-join or send invite?
        # Requirement: "Confirm join" (Notify user, confirm join)
        # So we just notify.
        
        self.db.commit()

    def match_with_other_tickets(self, ticket: Ticket):
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
        
        candidates = self.db.scalars(query).all()
        
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
            self.create_event_from_tickets(ticket, matches)

    def create_event_from_tickets(self, primary_ticket: Ticket, other_tickets: list[Ticket]):
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
        self.db.add(event)
        self.db.flush() # Get ID
        
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
            self.db.add(notification)
            
        self.db.commit()
