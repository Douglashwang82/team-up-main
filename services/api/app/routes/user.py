from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, desc, and_, or_
from app.core.db import SessionLocal
from app.core.auth import require_auth
from app.models.event import Event
from app.models.event_participant import EventParticipant
from app.models.event_join_request import EventJoinRequest
from app.models.booking import Booking
from app.models.user import User
from app.models.venue import TimeSlot, Court, Venue

bp = Blueprint("user", __name__)

# ===[ Get All User Events ]===
@bp.get("/events")
@require_auth
def get_user_events():
    """
    Get all events related to the user:
    - Created (Owner)
    - Joined (Participant)
    - Pending (Requested)
    """
    with SessionLocal() as s:
        # 1. Created Events
        created_events = s.execute(
            select(Event).where(Event.owner_user_id == g.user_id)
        ).scalars().all()

        # 2. Joined Events (excluding created ones if any overlap, though owner is usually participant too)
        # We want events where user is participant but NOT owner for this category to avoid dupes if we merge, 
        # but usually owner is also participant with role='owner'.
        # Let's simple get all participations
        participations = s.execute(
            select(EventParticipant, Event).join(Event)
            .where(EventParticipant.user_id == g.user_id)
        ).all()
        
        # 3. Pending Requests
        pending_requests = s.execute(
            select(EventJoinRequest, Event).join(Event)
            .where(
                and_(
                    EventJoinRequest.applicant_user_id == g.user_id,
                    EventJoinRequest.status == "submitted"
                )
            )
        ).all()

        # Process results into a unique dictionary keyed by event_id to avoid duplicates
        # Priority: Owner > Member > Applicant
        events_map = {}

        # Dictionary to store event data
        def serialize_event(event, role, join_request=None):
            return {
                "id": str(event.id),
                "title": event.title,
                "image": event.image,
                "description": event.description,
                "status": event.status,
                "max_participants": event.max_participants,
                "current_participants": 0, # To be filled if needed, or skipped for performance
                "owner_user_id": str(event.owner_user_id),
                "visibility": event.visibility,
                "duration_type": event.duration_type,
                "created_at": event.created_at.isoformat(),
                "role": role, # owner, member, applicant
                "join_request_id": str(join_request.id) if join_request else None,
                "join_request_status": join_request.status if join_request else None
            }

        # Add Created/Owner events
        for event in created_events:
            events_map[event.id] = serialize_event(event, "owner")

        # Add Joined events
        for participant, event in participations:
            # If already in map (e.g. as owner), skip or update?
            # Owner is already added. If role is not owner, it might be member.
            if event.id in events_map:
                if events_map[event.id]["role"] != "owner":
                     events_map[event.id]["role"] = participant.role
            else:
                events_map[event.id] = serialize_event(event, participant.role)

        # Add Pending requests
        for req, event in pending_requests:
            if event.id not in events_map:
                events_map[event.id] = serialize_event(event, "applicant", req)

        # Convert to list and sort by created_at desc
        results = list(events_map.values())
        results.sort(key=lambda x: x["created_at"], reverse=True)

        return jsonify(results)

# ===[ Get User Join Requests ]===
@bp.get("/events/join_requests")
@require_auth
def get_user_join_requests():
    """Get all join requests submitted by the user"""
    with SessionLocal() as s:
        requests = s.execute(
            select(EventJoinRequest, Event).join(Event)
            .where(EventJoinRequest.applicant_user_id == g.user_id)
            .order_by(desc(EventJoinRequest.created_at))
        ).all()

        return jsonify([{
            "id": str(req.id),
            "event": {
                "id": str(event.id),
                "title": event.title
            },
            "status": req.status,
            "message": req.message,
            "created_at": req.created_at.isoformat(),
            "reviewed_at": req.reviewed_at.isoformat() if req.reviewed_at else None
        } for req, event in requests])

@bp.get("/events/join_requests/<uuid:request_id>")
@require_auth
def get_join_request(request_id):
    """Get Details of a join request"""
    with SessionLocal() as s:
        req = s.get(EventJoinRequest, request_id)
        if not req or req.applicant_user_id != g.user_id:
            return jsonify({"error": "Request not found"}), 404
        
        event = s.get(Event, req.event_id)
        
        return jsonify({
            "id": str(req.id),
            "event": {
                "id": str(event.id),
                "title": event.title,
                "description": event.description
            },
            "status": req.status,
            "message": req.message,
            "created_at": req.created_at.isoformat(),
            "reviewed_at": req.reviewed_at.isoformat() if req.reviewed_at else None
        })

@bp.delete("/events/join_requests/<uuid:request_id>")
@require_auth
def delete_join_request(request_id):
    """Cancel (delete) a join request"""
    with SessionLocal() as s:
        req = s.get(EventJoinRequest, request_id)
        if not req or req.applicant_user_id != g.user_id:
            return jsonify({"error": "Request not found"}), 404
        
        if req.status != "submitted":
            return jsonify({"error": "Cannot cancel processed request"}), 400

        s.delete(req)
        s.commit()
        return jsonify({"message": "Request cancelled"})

# ===[ User Bookings ]===
@bp.get("/bookings")
@require_auth
def get_user_bookings():
    """Get all bookings for the user"""
    # Simply reusing logic or re-implementing 
    with SessionLocal() as s:
        bookings = s.execute(
            select(Booking, TimeSlot, Court, Venue).join(
                TimeSlot, Booking.time_slot_id == TimeSlot.id
            ).join(
                Court, TimeSlot.court_id == Court.id
            ).join(
                Venue, Court.venue_id == Venue.id
            ).where(Booking.owner_user_id == g.user_id)
            .order_by(desc(Booking.created_at))
        ).all()

        results = []
        for booking, time_slot, court, venue in bookings:
            results.append({
                "id": str(booking.id),
                "status": booking.status,
                "payment_status": booking.payment_status,
                "time_slot": {
                    "starts_at": time_slot.starts_at.isoformat(),
                    "ends_at": time_slot.ends_at.isoformat(),
                    "price_cents": time_slot.price_cents,
                    "currency": time_slot.currency,
                },
                "court": {
                    "name": court.name,
                    "sport_type": court.sport_type,
                },
                "venue": {
                    "name": venue.name,
                    "address": venue.address,
                },
                "created_at": booking.created_at.isoformat()
            })
        return jsonify(results)

# ===[ User Info ]===
@bp.get("/info")
@require_auth
def get_user_info():
    with SessionLocal() as s:
        u = s.get(User, g.user_id)
        if not u: return jsonify({"error": "Not found"}), 404
        return jsonify({
            "id": str(u.id),
            "email": u.email,
            "display_name": u.display_name,
            "avatar_url": u.avatar_url,
            "phone": u.phone,
            "preferred_sports": u.preferred_sports,
            "skill_levels": u.skill_levels,
            "preferred_time_slots": u.preferred_time_slots,
            "preferred_language": u.preferred_language,
            "custom_preferences": u.custom_preferences
        })

@bp.put("/info")
@require_auth
def update_user_info():
    data = request.get_json() or {}
    with SessionLocal() as s:
        u = s.get(User, g.user_id)
        if not u: return jsonify({"error": "Not found"}), 404
        
        if "display_name" in data: u.display_name = data["display_name"]
        if "avatar_url" in data: u.avatar_url = data["avatar_url"]
        if "phone" in data: u.phone = data["phone"]
        if "preferred_sports" in data: u.preferred_sports = data["preferred_sports"]
        if "skill_levels" in data: u.skill_levels = data["skill_levels"]
        if "preferred_time_slots" in data: u.preferred_time_slots = data["preferred_time_slots"]
        if "preferred_language" in data: u.preferred_language = data["preferred_language"]
        if "custom_preferences" in data: u.custom_preferences = data["custom_preferences"]
        
        s.commit()
        s.refresh(u)
        
        return jsonify({
            "id": str(u.id),
            "email": u.email,
            "display_name": u.display_name,
            "avatar_url": u.avatar_url,
            "phone": u.phone,
            "preferred_sports": u.preferred_sports,
            "skill_levels": u.skill_levels,
            "preferred_time_slots": u.preferred_time_slots,
            "preferred_language": u.preferred_language,
            "custom_preferences": u.custom_preferences
        })


# ===[ Skill-based Matchmaking ]===

SKILL_ORDER = ["beginner", "intermediate", "advanced"]

def _skill_distance(a: str | None, b: str | None) -> int | None:
    """Return distance between two skill levels, or None if either is missing."""
    if not a or not b:
        return None
    a_lower, b_lower = a.lower(), b.lower()
    if a_lower not in SKILL_ORDER or b_lower not in SKILL_ORDER:
        return None
    return abs(SKILL_ORDER.index(a_lower) - SKILL_ORDER.index(b_lower))


@bp.get("/matchmaking")
@require_auth
def get_matched_users():
    """Find users with similar sports and skill levels."""
    limit = min(int(request.args.get("limit", 20)), 50)

    with SessionLocal() as s:
        me = s.get(User, g.user_id)
        if not me:
            return jsonify({"error": "User not found"}), 404

        my_sports = set(me.preferred_sports or [])
        my_skills = me.skill_levels or {}

        if not my_sports:
            return jsonify([])  # Can't match without sport preferences

        # Query other users that have at least some preferred_sports set
        candidates = s.execute(
            select(User).where(
                User.id != g.user_id,
                User.preferred_sports.isnot(None),
            )
        ).scalars().all()

        scored = []
        for user in candidates:
            their_sports = set(user.preferred_sports or [])
            their_skills = user.skill_levels or {}

            shared = my_sports & their_sports
            if not shared:
                continue

            score = 0
            skill_compat = {}

            for sport in shared:
                score += 3  # shared sport bonus

                dist = _skill_distance(my_skills.get(sport), their_skills.get(sport))
                if dist == 0:
                    score += 3
                    skill_compat[sport] = "exact"
                elif dist == 1:
                    score += 1
                    skill_compat[sport] = "close"
                else:
                    skill_compat[sport] = "different" if dist is not None else "unknown"

            scored.append({
                "user": {
                    "id": str(user.id),
                    "display_name": user.display_name,
                    "avatar_url": user.avatar_url,
                    "preferred_sports": user.preferred_sports,
                    "skill_levels": user.skill_levels,
                },
                "match_score": score,
                "shared_sports": sorted(shared),
                "skill_compatibility": skill_compat,
            })

        scored.sort(key=lambda x: x["match_score"], reverse=True)
        return jsonify(scored[:limit])
