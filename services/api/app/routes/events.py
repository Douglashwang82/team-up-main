# app/routes/events.py
from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, func, and_, desc
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from uuid import UUID

from app.core.db import SessionLocal
from app.core.auth import optional_auth, require_auth
from app.models.event import Event
from app.models.event_join_request import EventJoinRequest as JoinRequest
from app.models.event_participant import EventParticipant
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
            venue_id=data.get("venue_id"),
            court_id=data.get("court_id"),
            visibility=data.get("visibility", "public"),
            duration_type=data.get("duration_type", "temporary"),
            status=data.get("status", "open"),
            image=data.get("image"),
        )

        s.add(event)
        s.flush()  # Get ID

        # Auto-add owner as participant
        owner_participant = EventParticipant(
            event_id=event.id,
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
            "image": event.image,
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
        for field in ["title", "description", "status", "max_participants", "visibility", "duration_type", "image", "venue_id", "court_id"]:
            if field in data:
                setattr(event, field, data[field])

        s.commit()

        return jsonify({
            "id": str(event.id),
            "title": event.title,
            "image": event.image,
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
            event_id=event_id,
            status=BookingStatus.pending.value,
            payment_status=PaymentStatus.none.value,
        )

        s.add(booking)
        s.commit()
        s.refresh(booking)

        return jsonify({
            "id": str(booking.id),
            "event_id": str(booking.event_id),
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
                Booking.event_id == event_id
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
    """List Events with filtering and search support"""
    status = request.args.get("status", "open")
    visibility = request.args.get("visibility")
    keyword = request.args.get("keyword", "").strip()
    datetime_after_str = request.args.get("datetime_after")
    division = request.args.get("division")
    category = request.args.get("category")
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = max(int(request.args.get("offset", 0)), 0)

    with SessionLocal() as s:
        query = select(Event)

        if status:
            query = query.where(Event.status == status)
        if visibility:
            query = query.where(Event.visibility == visibility)
        if keyword:
            query = query.where(Event.title.ilike(f"%{keyword}%"))

        if datetime_after_str or division or category:
            query = query.join(Booking, Booking.event_id == Event.id)\
                         .join(TimeSlot, Booking.time_slot_id == TimeSlot.id)\
                         .join(Court, TimeSlot.court_id == Court.id)\
                         .join(Venue, Court.venue_id == Venue.id)

            if datetime_after_str:
                try:
                    dt = _parse_dt(datetime_after_str)
                    query = query.where(TimeSlot.starts_at >= dt)
                except ValueError:
                    pass
            
            if division:
                query = query.where(Venue.address.ilike(f"%{division}%"))
            
            if category:
                query = query.where(Court.sport_type == category)

            query = query.distinct()

        results = s.execute(
            query.order_by(desc(Event.created_at)).offset(offset).limit(limit)
        ).scalars().all()

        event_list = []
        for event in results:
            # Calculate participant count
            participant_count = s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.event_id == event.id)
            ) or 0

            # Get owner info
            owner = s.get(User, event.owner_user_id)
            owner_data = None
            if owner:
                owner_data = {
                    "id": str(owner.id),
                    "display_name": owner.display_name,
                    "avatar_url": owner.avatar_url,
                }

            # Get participants list
            participants = s.execute(
                select(EventParticipant, User).outerjoin(
                    User, EventParticipant.user_id == User.id
                ).where(EventParticipant.event_id == event.id)
            ).all()

            participant_list = []
            for participant, user in participants:
                participant_list.append({
                    "id": str(participant.id),
                    "user_id": str(participant.user_id) if participant.user_id else None,
                    "display_name": participant.display_name or (user.display_name if user else None),
                    "email": participant.email or (user.email if user else None),
                    "phone": participant.phone,
                    "role": participant.role,
                    "avatar_url": user.avatar_url if user else None,
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
                    Booking.event_id == event.id
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

            user_join_status = "none"
            if hasattr(g, 'user_id') and g.user_id:
                if any(str(p.user_id) == str(g.user_id) for p, _ in participants):
                    user_join_status = "joined"
                else:
                    jr = s.execute(
                        select(JoinRequest).where(
                            and_(
                                JoinRequest.event_id == event.id,
                                JoinRequest.applicant_user_id == g.user_id,
                                JoinRequest.status == "submitted"
                            )
                        )
                    ).scalar_one_or_none()
                    if jr:
                        user_join_status = "pending"

            event_list.append({
                "id": str(event.id),
                "title": event.title,
                "image": event.image,
                "description": event.description,
                "status": event.status,
                "max_participants": event.max_participants,
                "current_participants": participant_count,
                "owner": owner_data,
                "visibility": event.visibility,
                "duration_type": event.duration_type,
                "created_at": event.created_at.isoformat(),
                "participants": participant_list,
                "bookings": booking_list,
                "user_join_status": user_join_status,
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
            .where(EventParticipant.event_id == event.id)
        ) or 0

        # Get participants list
        participants = s.execute(
            select(EventParticipant, User).outerjoin(
                User, EventParticipant.user_id == User.id
            ).where(EventParticipant.event_id == event.id)
        ).all()

        participant_list = []
        for participant, user in participants:
            participant_list.append({
                "id": str(participant.id),
                "user_id": str(participant.user_id) if participant.user_id else None,
                "display_name": participant.display_name or (user.display_name if user else None),
                "email": participant.email or (user.email if user else None),
                "role": participant.role,
                "avatar_url": user.avatar_url if user else None,
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
                Booking.event_id == event_id
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

        user_join_status = "none"
        if hasattr(g, 'user_id') and g.user_id:
            if any(str(p.user_id) == str(g.user_id) for p, _ in participants):
                user_join_status = "joined"
            else:
                jr = s.execute(
                    select(JoinRequest).where(
                        and_(
                            JoinRequest.event_id == event.id,
                            JoinRequest.applicant_user_id == g.user_id,
                            JoinRequest.status == "submitted"
                        )
                    )
                ).scalar_one_or_none()
                if jr:
                    user_join_status = "pending"

        return jsonify({
            "id": str(event.id),
            "title": event.title,
            "image": event.image,
            "description": event.description,
            "status": event.status,
            "max_participants": event.max_participants,
            "current_participants": participant_count,
            "owner_user_id": str(event.owner_user_id),
            "visibility": event.visibility,
            "duration_type": event.duration_type,
            "participants": participant_list,
            "bookings": booking_list,
            "user_join_status": user_join_status,
            "created_at": event.created_at.isoformat(),
            "updated_at": event.updated_at.isoformat(),
        })

# ===[ Get Events Created by User ]===
@bp.get("/my/created")
@require_auth
def get_my_created_events():
    """Get Events created/owned by the authenticated user"""
    with SessionLocal() as s:
        events = s.execute(
            select(Event)
            .where(Event.owner_user_id == g.user_id)
            .order_by(desc(Event.created_at))
        ).scalars().all()
        
        event_list = []
        for event in events:
            # Calculate participant count
            participant_count = s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.event_id == event.id)
            ) or 0
            
            event_list.append({
                "id": str(event.id),
                "title": event.title,
                "image": event.image,
                "description": event.description,
                "status": event.status,
                "max_participants": event.max_participants,
                "current_participants": participant_count,
                "owner_user_id": str(event.owner_user_id),
                "visibility": event.visibility,
                "duration_type": event.duration_type,
                "created_at": event.created_at.isoformat(),
                "updated_at": event.updated_at.isoformat(),
            })
        
        return jsonify(event_list)

# ===[ Get Events User Has Joined ]===
@bp.get("/my/joined")
@require_auth
def get_my_joined_events():
    """Get Events where the authenticated user is a participant (excluding owned events)"""
    with SessionLocal() as s:
        # Get events where user is a participant but not the owner
        participants = s.execute(
            select(EventParticipant, Event).join(
                Event, EventParticipant.event_id == Event.id
            ).where(
                and_(
                    EventParticipant.user_id == g.user_id,
                    EventParticipant.role == "member"  # Exclude owner role
                )
            ).order_by(desc(EventParticipant.created_at))
        ).all()
        
        event_list = []
        for participant, event in participants:
            # Calculate participant count
            participant_count = s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.event_id == event.id)
            ) or 0
            
            event_list.append({
                "id": str(event.id),
                "title": event.title,
                "image": event.image,
                "description": event.description,
                "status": event.status,
                "max_participants": event.max_participants,
                "current_participants": participant_count,
                "owner_user_id": str(event.owner_user_id),
                "visibility": event.visibility,
                "duration_type": event.duration_type,
                "created_at": event.created_at.isoformat(),
                "updated_at": event.updated_at.isoformat(),
                "joined_at": participant.created_at.isoformat(),
            })
        
        return jsonify(event_list)

# ===[ Get Events with Pending Join Requests ]===
@bp.get("/my/pending")
@require_auth
def get_my_pending_events():
    """Get Events where the authenticated user has submitted join requests"""
    with SessionLocal() as s:
        # Get events where user has pending join requests
        join_requests = s.execute(
            select(JoinRequest, Event).join(
                Event, JoinRequest.event_id == Event.id
            ).where(
                and_(
                    JoinRequest.applicant_user_id == g.user_id,
                    JoinRequest.status == "submitted"
                )
            ).order_by(desc(JoinRequest.created_at))
        ).all()
        
        event_list = []
        for join_request, event in join_requests:
            # Calculate participant count
            participant_count = s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.event_id == event.id)
            ) or 0
            
            event_list.append({
                "id": str(event.id),
                "title": event.title,
                "image": event.image,
                "description": event.description,
                "status": event.status,
                "max_participants": event.max_participants,
                "current_participants": participant_count,
                "owner_user_id": str(event.owner_user_id),
                "visibility": event.visibility,
                "duration_type": event.duration_type,
                "created_at": event.created_at.isoformat(),
                "updated_at": event.updated_at.isoformat(),
                "join_request_id": str(join_request.id),
                "join_request_status": join_request.status,
                "join_request_created_at": join_request.created_at.isoformat(),
            })
        
        return jsonify(event_list)


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
            .where(EventParticipant.event_id == event_id)
        ) or 0
        
        if current_count >= event.max_participants:
            return jsonify({"error": "event_full"}), 400
        
        # Check if already applied or joined
        if g.user_id:
            existing_request = s.execute(
                select(JoinRequest).where(
                    and_(
                        JoinRequest.event_id == event_id,
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
                        EventParticipant.event_id == event_id,
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
                        Notification.related_event_ids.contains([event_id]),
                        Notification.type == "match_found"
                    )
                )
            ).scalar_one_or_none()
            
            status = "submitted"
            if match_notification:
                status = "approved"

            join_request = JoinRequest(
                event_id=event_id,
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
                    event_id=event_id,
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
                event_id=event_id,
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
                JoinRequest.event_id == event_id
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
        if not join_request or join_request.event_id != event_id:
            return jsonify({"error": "request_not_found"}), 404
        
        if join_request.status != "submitted":
            return jsonify({"error": "already_reviewed"}), 400
        
        if action == "approve":
            # Check if full
            current_count = s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.event_id == event_id)
            ) or 0

            if current_count >= event.max_participants:
                return jsonify({"error": "event_full"}), 400

            # Add participant
            try:
                participant = EventParticipant(
                    event_id=event_id,
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

# ===[ Split Bill ]===
@bp.post("/<uuid:event_id>/split-bill")
@require_auth
def split_bill(event_id):
    """Calculate and assign split bills to participants (Owner only)"""
    data = request.get_json(silent=True) or {}
    total_amount = data.get("total_amount")
    
    if total_amount is None or not isinstance(total_amount, (int, float)) or total_amount < 0:
        return jsonify({"error": "invalid_amount", "message": "total_amount must be a positive number"}), 400

    participant_ids_to_split = data.get("participant_ids") # Optional UUIDs
        
    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "event_not_found"}), 404
            
        if str(event.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403
            
        # Get participants to split among
        query = select(EventParticipant).where(EventParticipant.event_id == event_id)
        
        if participant_ids_to_split:
            try:
                valid_uuids = [UUID(str(pid)) for pid in participant_ids_to_split]
                query = query.where(EventParticipant.id.in_(valid_uuids))
            except ValueError:
                return jsonify({"error": "invalid_participant_ids"}), 400
                
        participants = s.execute(query).scalars().all()
        
        if not participants:
            return jsonify({"error": "no_participants"}), 400
            
        num_participants = len(participants)
        split_amount = int(total_amount // num_participants)
        remainder = int(total_amount % num_participants)
        
        updated_participants = []
        for i, participant in enumerate(participants):
            # Assign remainder to the first few participants
            amount_for_this_person = split_amount + (1 if i < remainder else 0)
            participant.amount_due = amount_for_this_person
            participant.payment_status = "unpaid"
            updated_participants.append({
                "id": str(participant.id),
                "amount_due": participant.amount_due,
                "payment_status": participant.payment_status,
            })
            
        s.commit()
        
        return jsonify({
            "ok": True,
            "total_amount": total_amount,
            "split_among": num_participants,
            "participants": updated_participants
        })

# ===[ Update Participant Payment Status ]===
@bp.patch("/<uuid:event_id>/participants/<uuid:participant_id>/payment")
@require_auth
def update_participant_payment(event_id, participant_id):
    """Update a participant's payment status (Owner only)"""
    data = request.get_json(silent=True) or {}
    new_status = data.get("payment_status")
    
    if new_status not in ("unpaid", "paid"):
        return jsonify({"error": "invalid_status", "message": "payment_status must be 'paid' or 'unpaid'"}), 400
        
    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "event_not_found"}), 404
            
        if str(event.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403
            
        participant = s.get(EventParticipant, participant_id)
        if not participant or participant.event_id != event_id:
            return jsonify({"error": "participant_not_found"}), 404
            
        participant.payment_status = new_status
        s.commit()
        
        return jsonify({
            "ok": True,
            "participant_id": str(participant.id),
            "payment_status": participant.payment_status
        })


# ===[ List Owned Events ]===
@bp.get("/owned")
@require_auth
def list_owned_events():
    """List open events owned by the current user."""
    with SessionLocal() as s:
        events = s.execute(
            select(Event).where(
                Event.owner_user_id == g.user_id,
                Event.status == "open",
            ).order_by(Event.created_at.desc())
        ).scalars().all()

        return jsonify([{
            "id": str(e.id),
            "title": e.title,
            "max_participants": e.max_participants,
            "participant_count": s.scalar(
                select(func.count()).select_from(EventParticipant)
                .where(EventParticipant.event_id == e.id)
            ) or 0,
        } for e in events])


# ===[ Invite User to Event ]===
@bp.post("/<uuid:event_id>/invite")
@require_auth
def invite_user(event_id):
    """Owner invites a user to join their event."""
    data = request.get_json(silent=True) or {}
    invitee_id = data.get("user_id")

    if not invitee_id:
        return jsonify({"error": "missing_user_id"}), 400

    with SessionLocal() as s:
        event = s.get(Event, event_id)
        if not event:
            return jsonify({"error": "event_not_found"}), 404

        if str(event.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        if event.status != "open":
            return jsonify({"error": "event_not_open"}), 400

        # Check capacity
        current_count = s.scalar(
            select(func.count()).select_from(EventParticipant)
            .where(EventParticipant.event_id == event_id)
        ) or 0
        if current_count >= event.max_participants:
            return jsonify({"error": "event_full"}), 400

        # Check already a participant
        existing = s.execute(
            select(EventParticipant).where(
                and_(
                    EventParticipant.event_id == event_id,
                    EventParticipant.user_id == UUID(invitee_id),
                )
            )
        ).scalar_one_or_none()
        if existing:
            return jsonify({"error": "already_joined"}), 400

        # Look up invitee
        invitee = s.get(User, UUID(invitee_id))
        if not invitee:
            return jsonify({"error": "user_not_found"}), 404

        # Create participant
        participant = EventParticipant(
            event_id=event_id,
            user_id=invitee.id,
            role="member",
            display_name=invitee.display_name or invitee.email,
            email=invitee.email,
            phone=invitee.phone or "",
        )
        s.add(participant)

        # Notify invitee
        owner = s.get(User, g.user_id)
        owner_name = owner.display_name if owner else "Unknown"
        notification = Notification(
            user_id=invitee.id,
            message=f"{owner_name} 邀請你加入活動「{event.title}」",
            type="event_invite",
            related_event_ids=[event_id],
        )
        s.add(notification)

        s.commit()

        return jsonify({
            "ok": True,
            "participant_id": str(participant.id),
            "message": f"已成功邀請 {invitee.display_name} 加入活動",
        }), 201
