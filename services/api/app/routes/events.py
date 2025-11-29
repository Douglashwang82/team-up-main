# app/routes/events.py
from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, func, and_, desc
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from uuid import UUID

from app.core.db import SessionLocal
from app.core.auth import optional_auth, require_auth
from app.models.teamup import TeamUp as Event
from app.models.teamup_join_request import TeamUpJoinRequest as JoinRequest
from app.models.teamup_participant import TeamUpParticipant as EventParticipant
from app.models.venue import TimeSlot, Court, Venue
from app.models.user import User
from app.models.booking import Booking
from app.models.notification import Notification
from app.core.types import BookingStatus, PaymentStatus

bp = Blueprint("events", __name__)

def _parse_dt(s: str):
    """Parse datetime string, defaulting to UTC if no timezone info"""
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        from datetime import timezone
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

# ===[ Create Event ]===
@bp.post("")
@require_auth
def create_event():
    """Create new Event"""
    data = request.get_json() or {}

    required = ["title", "max_participants"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": "missing_fields", "fields": missing}), 400
    
    if g.user_id is None:
        return jsonify({"error": "authentication_required"}), 401

    with SessionLocal() as s:
        user = s.get(User, g.user_id)
        if not user:
            return jsonify({"error": "user_not_found"}), 404
        
        event = Event(
            title=data["title"],
            description=data.get("description"),
            owner_user_id=g.user_id,
            max_participants=data["max_participants"],
            visibility=data.get("visibility", "public"),
            duration_type=data.get("duration_type", "temporary"),
            status=data.get("status", "open"),
        )

        s.add(event)
        s.flush()  # Get ID

        # Auto-add owner as participant
        owner_participant = EventParticipant(
            teamup_id=event.id, # Model field still teamup_id
            user_id=g.user_id,
            role="owner",
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        s.add(owner_participant)

        s.commit()

        return jsonify({
            "id": str(event.id),
            "title": event.title,
            "status": event.status,
            "max_participants": event.max_participants,
            "current_participants": 1,
            "visibility": event.visibility,
            "duration_type": event.duration_type,
        }), 201

# ===[ Update Event ]===
@bp.put("/<uuid:event_id>")
@require_auth
def update_event(event_id):
    """Update Event"""
    data = request.get_json() or {}

    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "not_found"}), 404

        if str(event.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Update fields
        for field in ["title", "description", "status", "max_participants", "visibility", "duration_type"]:
            if field in data:
                setattr(event, field, data[field])

        s.commit()

        return jsonify({
            "id": str(event.id),
            "title": event.title,
            "status": event.status,
            "max_participants": event.max_participants,
            "visibility": event.visibility,
            "duration_type": event.duration_type,
        })

# ===[ Delete Event ]===
@bp.delete("/<uuid:event_id>")
@require_auth
def delete_event(event_id):
    """Delete Event"""
    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "not_found"}), 404

        if str(event.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        s.delete(event)
        s.commit()

        return jsonify({"ok": True}) 

# ===[ Book time slot for Event ]===
@bp.post("/<uuid:event_id>/book")
@require_auth
def book_time_slot_for_event(event_id):
    """Book a time slot for an Event (can book multiple)"""
    data = request.get_json() or {}

    if "time_slot_id" not in data:
        return jsonify({"error": "time_slot_id_required"}), 400

    with SessionLocal() as s:
        # Verify Event exists and user is owner
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "event_not_found"}), 404

        if str(event.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Verify time slot exists
        try:
            time_slot_id = UUID(str(data["time_slot_id"]))
        except ValueError:
            return jsonify({"error": "invalid_time_slot_id"}), 400

        time_slot = s.get(TimeSlot, time_slot_id)
        if not time_slot:
            return jsonify({"error": "time_slot_not_found"}), 404

        if not time_slot.is_bookable:
            return jsonify({"error": "time_slot_not_bookable"}), 400

        # Check if time slot is already booked
        existing_booking = s.execute(
            select(Booking).where(
                and_(
                    Booking.time_slot_id == time_slot_id,
                    Booking.status.in_(["pending", "confirmed"])
                )
            )
        ).scalar_one_or_none()

        if existing_booking:
            return jsonify({"error": "time_slot_already_booked"}), 400

        # Create booking for Event
        booking = Booking(
            owner_user_id=g.user_id,
            time_slot_id=time_slot_id,
            teamup_id=event_id, # Model field still teamup_id
            status=BookingStatus.pending.value,
            payment_status=PaymentStatus.none.value,
        )

        s.add(booking)
        s.commit()
        s.refresh(booking)

        return jsonify({
            "id": str(booking.id),
            "event_id": str(booking.teamup_id),
            "time_slot_id": str(booking.time_slot_id),
            "status": booking.status,
            "payment_status": booking.payment_status,
            "created_at": booking.created_at.isoformat(),
        }), 201

# ===[ List Event bookings ]===
@bp.get("/<uuid:event_id>/bookings")
@optional_auth
def list_event_bookings(event_id):
    """List all bookings for an Event"""
    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "event_not_found"}), 404

        # Get all bookings for this Event
        bookings = s.execute(
            select(Booking, TimeSlot, Court, Venue).join(
                TimeSlot, Booking.time_slot_id == TimeSlot.id
            ).join(
                Court, TimeSlot.court_id == Court.id
            ).join(
                Venue, Court.venue_id == Venue.id
            ).where(
                Booking.teamup_id == event_id # Model field still teamup_id
            ).order_by(TimeSlot.starts_at)
        ).all()

        booking_list = []
        for booking, time_slot, court, venue in bookings:
            booking_list.append({
                "id": str(booking.id),
                "status": booking.status,
                "payment_status": booking.payment_status,
                "time_slot": {
                    "id": str(time_slot.id),
                    "starts_at": time_slot.starts_at.isoformat(),
                    "ends_at": time_slot.ends_at.isoformat(),
                    "price_cents": time_slot.price_cents,
                    "currency": time_slot.currency,
                },
                "court": {
                    "id": str(court.id),
                    "name": court.name,
                    "sport_type": court.sport_type,
                },
                "venue": {
                    "id": str(venue.id),
                    "name": venue.name,
                    "address": venue.address,
                    "city": venue.city,
                },
                "created_at": booking.created_at.isoformat(),
            })

        return jsonify(booking_list)

# ===[ List Events ]===
@bp.get("")
@optional_auth
def list_events():
    """List Events, support filtering"""
    status = request.args.get("status", "open")
    visibility = request.args.get("visibility")
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = max(int(request.args.get("offset", 0)), 0)

    with SessionLocal() as s:
        query = select(Event)

        if status:
            query = query.where(Event.status == status)
        if visibility:
            query = query.where(Event.visibility == visibility)

        results = s.execute(
            query.order_by(desc(Event.created_at)).offset(offset).limit(limit)
        ).scalars().all()

        event_list = []
        for event in results:
            # Calculate participant count
            participant_count = s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.teamup_id == event.id) # Model field still teamup_id
            ) or 0

            event_list.append({
                "id": str(event.id),
                "title": event.title,
                "description": event.description,
                "status": event.status,
                "max_participants": event.max_participants,
                "current_participants": participant_count,
                "visibility": event.visibility,
                "duration_type": event.duration_type,
                "created_at": event.created_at.isoformat(),
            })

        return jsonify(event_list)

# ===[ Search Events ]===
@bp.get("/search")
@optional_auth
def search_events():
    keyword = request.args.get("keyword", "").strip()
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = max(int(request.args.get("offset", 0)), 0)

    if not keyword:
        return jsonify({"error": "title_keyword_required"}), 400

    with SessionLocal() as s:
        query = select(Event).where(Event.title.ilike(f"%{keyword}%"))

        results = s.execute(
            query.order_by(desc(Event.created_at)).offset(offset).limit(limit)
        ).scalars().all()

        event_list = []
        for event in results:
            # Calculate participant count
            participant_count = s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.teamup_id == event.id) # Model field still teamup_id
            ) or 0

            event_list.append({
                "id": str(event.id),
                "title": event.title,
                "description": event.description,
                "status": event.status,
                "max_participants": event.max_participants,
                "current_participants": participant_count,
                "visibility": event.visibility,
                "duration_type": event.duration_type,
                "created_at": event.created_at.isoformat(),
            })

        return jsonify(event_list)

# ===[ Get Single Event ]===
@bp.get("/<uuid:event_id>")
@optional_auth
def get_event(event_id):
    """Get Event details"""
    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "not_found"}), 404

        # Calculate participant count
        participant_count = s.scalar(
            select(func.count()).select_from(EventParticipant)
            .where(EventParticipant.teamup_id == event.id) # Model field still teamup_id
        ) or 0

        # Get participants list
        participants = s.execute(
            select(EventParticipant, User).outerjoin(
                User, EventParticipant.user_id == User.id
            ).where(EventParticipant.teamup_id == event.id) # Model field still teamup_id
        ).all()

        participant_list = []
        for participant, user in participants:
            participant_list.append({
                "id": str(participant.id),
                "user_id": str(participant.user_id) if participant.user_id else None,
                "display_name": participant.display_name or (user.display_name if user else None),
                "email": participant.email or (user.email if user else None),
                "role": participant.role,
                "joined_at": participant.created_at.isoformat(),
            })

        # Get associated bookings
        bookings = s.execute(
            select(Booking, TimeSlot, Court, Venue).join(
                TimeSlot, Booking.time_slot_id == TimeSlot.id
            ).join(
                Court, TimeSlot.court_id == Court.id
            ).join(
                Venue, Court.venue_id == Venue.id
            ).where(
                Booking.teamup_id == event_id # Model field still teamup_id
            ).order_by(TimeSlot.starts_at)
        ).all()

        booking_list = []
        for booking, time_slot, court, venue in bookings:
            booking_list.append({
                "id": str(booking.id),
                "status": booking.status,
                "payment_status": booking.payment_status,
                "time_slot": {
                    "id": str(time_slot.id),
                    "starts_at": time_slot.starts_at.isoformat(),
                    "ends_at": time_slot.ends_at.isoformat(),
                    "price_cents": time_slot.price_cents,
                    "currency": time_slot.currency,
                },
                "court": {
                    "id": str(court.id),
                    "name": court.name,
                    "sport_type": court.sport_type,
                },
                "venue": {
                    "id": str(venue.id),
                    "name": venue.name,
                    "address": venue.address,
                    "city": venue.city,
                },
            })

        return jsonify({
            "id": str(event.id),
            "title": event.title,
            "description": event.description,
            "status": event.status,
            "max_participants": event.max_participants,
            "current_participants": participant_count,
            "owner_user_id": str(event.owner_user_id),
            "visibility": event.visibility,
            "duration_type": event.duration_type,
            "participants": participant_list,
            "bookings": booking_list,
            "created_at": event.created_at.isoformat(),
            "updated_at": event.updated_at.isoformat(),
        })

# ===[ Join Event ]===
@bp.post("/<uuid:event_id>/join")
@optional_auth
def join_event(event_id):
    """Request to join Event"""
    data = request.get_json(silent=True) or {}
    
    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "not_found"}), 404
        
        if event.status != "open":
            return jsonify({"error": "event_not_open"}), 400
        
        # Check if full
        current_count = s.scalar(
            select(func.count()).select_from(EventParticipant)
            .where(EventParticipant.teamup_id == event_id) # Model field still teamup_id
        ) or 0
        
        if current_count >= event.max_participants:
            return jsonify({"error": "event_full"}), 400
        
        # Check if already applied or joined
        if g.user_id:
            existing_request = s.execute(
                select(JoinRequest).where(
                    and_(
                        JoinRequest.teamup_id == event_id, # Model field still teamup_id
                        JoinRequest.applicant_user_id == g.user_id,
                        JoinRequest.status == "submitted"
                    )
                )
            ).scalar_one_or_none()
            
            if existing_request:
                return jsonify({"error": "already_applied"}), 400
            
            existing_participant = s.execute(
                select(EventParticipant).where(
                    and_(
                        EventParticipant.teamup_id == event_id, # Model field still teamup_id
                        EventParticipant.user_id == g.user_id
                    )
                )
            ).scalar_one_or_none()
            
            if existing_participant:
                return jsonify({"error": "already_joined"}), 400
        
        # Create request
        if g.user_id:
            user = s.get(User, g.user_id)
            
            # Check for existing match notification to auto-approve
            match_notification = s.execute(
                select(Notification).where(
                    and_(
                        Notification.user_id == g.user_id,
                        Notification.related_entity_id == event_id,
                        Notification.type == "match_found"
                    )
                )
            ).scalar_one_or_none()
            
            status = "submitted"
            if match_notification:
                status = "approved"

            join_request = JoinRequest(
                teamup_id=event_id, # Model field still teamup_id
                applicant_user_id=g.user_id,
                applicant_name=user.display_name or user.email,
                applicant_email=user.email,
                applicant_phone=user.phone,
                message=data.get("message"),
                status=status,
            )
            
            s.add(join_request)
            s.flush() # Get ID
            
            if status == "approved":
                # Auto-add participant
                participant = EventParticipant(
                    teamup_id=event_id, # Model field still teamup_id
                    user_id=g.user_id,
                    role="member",
                    display_name=user.display_name or user.email,
                    email=user.email,
                    phone=user.phone,
                    join_request_id=join_request.id,
                )
                s.add(participant)
                
        else:
            # Non-member application
            required = ["applicant_name", "applicant_email"]
            missing = [k for k in required if k not in data]
            if missing:
                return jsonify({"error": "missing_fields", "fields": missing}), 400
            
            join_request = JoinRequest(
                teamup_id=event_id, # Model field still teamup_id
                applicant_user_id=None,
                applicant_name=data["applicant_name"],
                applicant_email=data["applicant_email"],
                applicant_phone=data.get("applicant_phone"),
                message=data.get("message"),
                status="submitted",
            )
            s.add(join_request)
        
        s.commit()
        
        return jsonify({
            "id": str(join_request.id),
            "status": join_request.status,
            "message": "Join request submitted successfully" if join_request.status == "submitted" else "Joined successfully"
        }), 201

# ===[ List Join Requests ]===
@bp.get("/<uuid:event_id>/join-requests")
@require_auth
def list_join_requests(event_id):
    """List join requests for an Event (Owner only)"""
    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "not_found"}), 404
        
        if str(event.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403
        
        requests = s.execute(
            select(JoinRequest).where(
                JoinRequest.teamup_id == event_id # Model field still teamup_id
            ).order_by(JoinRequest.created_at.desc())
        ).scalars().all()
        
        return jsonify([{
            "id": str(req.id),
            "applicant_user_id": str(req.applicant_user_id) if req.applicant_user_id else None,
            "applicant_name": req.applicant_name,
            "applicant_email": req.applicant_email,
            "applicant_phone": req.applicant_phone,
            "message": req.message,
            "status": req.status,
            "created_at": req.created_at.isoformat(),
            "reviewed_at": req.reviewed_at.isoformat() if req.reviewed_at else None,
        } for req in requests])

# ===[ Review Join Request ]===
@bp.post("/<uuid:event_id>/join-requests/<uuid:request_id>/review")
@require_auth
def review_join_request(event_id, request_id):
    """Review join request (Owner only)"""
    data = request.get_json(silent=True) or {}
    action = (data.get("action") or "").lower()
    
    if action not in ("approve", "reject"):
        return jsonify({"error": "invalid_action"}), 400
    
    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "event_not_found"}), 404
        
        if str(event.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403
        
        join_request = s.get(JoinRequest, request_id)
        if not join_request or join_request.teamup_id != event_id: # Model field still teamup_id
            return jsonify({"error": "request_not_found"}), 404
        
        if join_request.status != "submitted":
            return jsonify({"error": "already_reviewed"}), 400
        
        if action == "approve":
            # Check if full
            current_count = s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.teamup_id == event_id) # Model field still teamup_id
            ) or 0

            if current_count >= event.max_participants:
                return jsonify({"error": "event_full"}), 400

            # Add participant
            try:
                participant = EventParticipant(
                    teamup_id=event_id, # Model field still teamup_id
                    user_id=join_request.applicant_user_id,
                    role="member",
                    display_name=join_request.applicant_name,
                    email=join_request.applicant_email,
                    phone=join_request.applicant_phone,
                    join_request_id=request_id,
                )
                s.add(participant)
            except IntegrityError:
                s.rollback()
                return jsonify({"error": "already_joined"}), 409

            join_request.status = "approved"
        else:
            join_request.status = "rejected"
        
        join_request.reviewed_at = datetime.utcnow()
        s.commit()
        
        return jsonify({
            "ok": True,
            "status": join_request.status,
            "message": f"Request {action}d successfully"
        })

