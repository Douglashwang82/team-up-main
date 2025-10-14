# app/routes/bookings.py
from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, and_
from datetime import datetime
from uuid import UUID

from app.core.db import SessionLocal
from app.core.auth import require_auth
from app.models.booking import Booking
from app.models.booking_assignment import BookingAssignment
from app.models.venue import Venue, VenueTimeslot
from app.models.teamup import TeamUp
from app.models.event import Event

bp = Blueprint("bookings", __name__)


def _serialize_booking(booking: Booking) -> dict:
    """Serialize booking to dict"""
    return {
        "id": str(booking.id),
        "owner_user_id": str(booking.owner_user_id),
        "venue_id": str(booking.venue_id),
        "timeslot_id": str(booking.timeslot_id),
        "status": booking.status,
        "payment_status": booking.payment_status,
        "created_at": booking.created_at.isoformat(),
        "updated_at": booking.updated_at.isoformat(),
    }


def _serialize_booking_detail(booking: Booking, venue: Venue, timeslot: VenueTimeslot, assignments: list) -> dict:
    """Serialize booking detail with related data"""
    return {
        "id": str(booking.id),
        "owner_user_id": str(booking.owner_user_id),
        "venue_id": str(booking.venue_id),
        "timeslot_id": str(booking.timeslot_id),
        "status": booking.status,
        "payment_status": booking.payment_status,
        "venue": {
            "id": str(venue.id),
            "name": venue.name,
            "address": venue.address,
            "city": venue.city,
        },
        "timeslot": {
            "id": str(timeslot.id),
            "starts_at": timeslot.starts_at.isoformat(),
            "ends_at": timeslot.ends_at.isoformat(),
            "price_cents": timeslot.price_cents,
            "currency": timeslot.currency,
        },
        "assignments": [_serialize_assignment(a) for a in assignments],
        "created_at": booking.created_at.isoformat(),
        "updated_at": booking.updated_at.isoformat(),
    }


def _serialize_assignment(assignment: BookingAssignment) -> dict:
    """Serialize booking assignment to dict"""
    return {
        "id": str(assignment.id),
        "booking_id": str(assignment.booking_id),
        "assignment_type": assignment.assignment_type,
        "teamup_id": str(assignment.teamup_id) if assignment.teamup_id else None,
        "event_id": str(assignment.event_id) if assignment.event_id else None,
        "is_primary": assignment.is_primary,
        "priority": assignment.priority,
        "assigned_by_user_id": str(assignment.assigned_by_user_id),
        "assignment_reason": assignment.assignment_reason,
        "contribution_amount_cents": assignment.contribution_amount_cents,
        "contribution_percentage": float(assignment.contribution_percentage) if assignment.contribution_percentage else None,
        "status": assignment.status,
        "created_at": assignment.created_at.isoformat(),
        "updated_at": assignment.updated_at.isoformat(),
    }


# ===[ List user's bookings ]===
@bp.get("")
@require_auth
def list_bookings():
    """List bookings for the authenticated user"""
    status = request.args.get("status")
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = max(int(request.args.get("offset", 0)), 0)

    with SessionLocal() as s:
        query = select(Booking).where(Booking.owner_user_id == g.user_id)

        if status:
            query = query.where(Booking.status == status)

        query = query.order_by(Booking.created_at.desc()).offset(offset).limit(limit)
        bookings = s.execute(query).scalars().all()

        return jsonify([_serialize_booking(b) for b in bookings])


# ===[ Get booking details ]===
@bp.get("/<uuid:booking_id>")
@require_auth
def get_booking(booking_id):
    """Get booking details by ID"""
    with SessionLocal() as s:
        booking = s.get(Booking, booking_id)
        if not booking:
            return jsonify({"error": "booking_not_found"}), 404

        # Check ownership
        if str(booking.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Get related data
        venue = s.get(Venue, booking.venue_id)
        timeslot = s.get(VenueTimeslot, booking.timeslot_id)
        assignments = s.execute(
            select(BookingAssignment).where(BookingAssignment.booking_id == booking_id)
        ).scalars().all()

        return jsonify(_serialize_booking_detail(booking, venue, timeslot, assignments))


# ===[ Assign booking to TeamUp or Event ]===
@bp.post("/<uuid:booking_id>/assign")
@require_auth
def assign_booking(booking_id):
    """Assign a booking to a TeamUp or Event"""
    data = request.get_json(silent=True) or {}

    # Validate required fields
    assignment_type = data.get("assignment_type")
    if not assignment_type or assignment_type not in ["teamup", "event"]:
        return jsonify({"error": "invalid_assignment_type"}), 400

    teamup_id = data.get("teamup_id")
    event_id = data.get("event_id")

    # Validate assignment target
    if assignment_type == "teamup" and not teamup_id:
        return jsonify({"error": "teamup_id_required"}), 400
    if assignment_type == "event" and not event_id:
        return jsonify({"error": "event_id_required"}), 400

    with SessionLocal() as s:
        # Check booking exists and user is owner
        booking = s.get(Booking, booking_id)
        if not booking:
            return jsonify({"error": "booking_not_found"}), 404

        if str(booking.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Validate target exists
        if assignment_type == "teamup":
            try:
                teamup_uuid = UUID(str(teamup_id))
            except (ValueError, AttributeError):
                return jsonify({"error": "invalid_teamup_id"}), 400

            teamup = s.get(TeamUp, teamup_uuid)
            if not teamup:
                return jsonify({"error": "teamup_not_found"}), 404

            # Check for existing assignment
            existing = s.execute(
                select(BookingAssignment).where(
                    and_(
                        BookingAssignment.booking_id == booking_id,
                        BookingAssignment.teamup_id == teamup_uuid
                    )
                )
            ).scalar_one_or_none()

            if existing:
                return jsonify({"error": "already_assigned"}), 400

            assignment = BookingAssignment(
                booking_id=booking_id,
                teamup_id=teamup_uuid,
                event_id=None,
                assignment_type="teamup",
                is_primary=data.get("is_primary", False),
                priority=data.get("priority", 1),
                assigned_by_user_id=g.user_id,
                assignment_reason=data.get("assignment_reason"),
                contribution_amount_cents=data.get("contribution_amount_cents"),
                contribution_percentage=data.get("contribution_percentage"),
                status="active",
            )

        else:  # assignment_type == "event"
            try:
                event_uuid = UUID(str(event_id))
            except (ValueError, AttributeError):
                return jsonify({"error": "invalid_event_id"}), 400

            event = s.get(Event, event_uuid)
            if not event:
                return jsonify({"error": "event_not_found"}), 404

            # Check for existing assignment
            existing = s.execute(
                select(BookingAssignment).where(
                    and_(
                        BookingAssignment.booking_id == booking_id,
                        BookingAssignment.event_id == event_uuid
                    )
                )
            ).scalar_one_or_none()

            if existing:
                return jsonify({"error": "already_assigned"}), 400

            assignment = BookingAssignment(
                booking_id=booking_id,
                teamup_id=None,
                event_id=event_uuid,
                assignment_type="event",
                is_primary=data.get("is_primary", False),
                priority=data.get("priority", 1),
                assigned_by_user_id=g.user_id,
                assignment_reason=data.get("assignment_reason"),
                contribution_amount_cents=data.get("contribution_amount_cents"),
                contribution_percentage=data.get("contribution_percentage"),
                status="active",
            )

        s.add(assignment)
        s.commit()
        s.refresh(assignment)

        return jsonify(_serialize_assignment(assignment)), 201


# ===[ List booking assignments ]===
@bp.get("/<uuid:booking_id>/assignments")
@require_auth
def list_assignments(booking_id):
    """List all assignments for a booking"""
    with SessionLocal() as s:
        booking = s.get(Booking, booking_id)
        if not booking:
            return jsonify({"error": "booking_not_found"}), 404

        # Check ownership
        if str(booking.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        assignments = s.execute(
            select(BookingAssignment).where(
                BookingAssignment.booking_id == booking_id
            ).order_by(BookingAssignment.priority, BookingAssignment.created_at)
        ).scalars().all()

        return jsonify([_serialize_assignment(a) for a in assignments])
