# app/routes/bookings.py
from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, and_
from datetime import datetime
from uuid import UUID

from app.core.db import SessionLocal
from app.core.auth import require_auth
from app.models.booking import Booking
from app.models.venue import Venue, Court, TimeSlot
from app.models.event import Event

bp = Blueprint("bookings", __name__)


def _serialize_booking(booking: Booking) -> dict:
    """Serialize booking to dict"""
    return {
        "id": str(booking.id),
        "owner_user_id": str(booking.owner_user_id),
        "time_slot_id": str(booking.time_slot_id),
        "event_id": str(booking.event_id) if booking.event_id else None,
        "status": booking.status,
        "payment_status": booking.payment_status,
        "created_at": booking.created_at.isoformat(),
        "updated_at": booking.updated_at.isoformat(),
    }


def _serialize_booking_detail(booking: Booking, time_slot: TimeSlot, court: Court, venue: Venue, event: Event | None = None) -> dict:
    """Serialize booking detail with related data"""
    return {
        "id": str(booking.id),
        "owner_user_id": str(booking.owner_user_id),
        "time_slot_id": str(booking.time_slot_id),
        "event_id": str(booking.event_id) if booking.event_id else None,
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
        "event": {
            "id": str(event.id),
            "title": event.title,
            "description": event.description,
        } if event else None,
        "created_at": booking.created_at.isoformat(),
        "updated_at": booking.updated_at.isoformat(),
    }


@bp.post("")
@require_auth
def create_booking():
    """Create a new booking for a time slot"""
    data = request.get_json() or {}

    if "time_slot_id" not in data:
        return jsonify({"error": "time_slot_id_required"}), 400

    with SessionLocal() as s:
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

        # Create booking
        booking = Booking(
            owner_user_id=g.user_id,
            time_slot_id=time_slot_id,
            event_id=data.get("event_id"),  # Optional event association
            status="pending",
            payment_status="none",
        )

        s.add(booking)
        s.commit()
        s.refresh(booking)

        return jsonify(_serialize_booking(booking)), 201



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


@bp.get("/<uuid:booking_id>")
@require_auth
def get_booking_by_id(booking_id):
    """Get booking details by ID"""
    with SessionLocal() as s:
        booking = s.get(Booking, booking_id)
        if not booking:
            return jsonify({"error": "booking_not_found"}), 404

        # Check ownership
        if str(booking.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Get related data
        time_slot = s.get(TimeSlot, booking.time_slot_id)
        if not time_slot:
            return jsonify({"error": "time_slot_not_found"}), 404

        court = s.get(Court, time_slot.court_id)
        if not court:
            return jsonify({"error": "court_not_found"}), 404

        venue = s.get(Venue, court.venue_id)
        if not venue:
            return jsonify({"error": "venue_not_found"}), 404

        # Get event if booking is associated with one
        event = None
        if booking.event_id:
            event = s.get(Event, booking.event_id)

        return jsonify(_serialize_booking_detail(booking, time_slot, court, venue, event))


@bp.put("/<uuid:booking_id>")
@require_auth
def update_booking_fully(booking_id):
    """Update booking fully (admin or full replace)"""
    data = request.get_json() or {}

    with SessionLocal() as s:
        booking = s.get(Booking, booking_id)
        if not booking:
            return jsonify({"error": "booking_not_found"}), 404

        # Check ownership
        if str(booking.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Update fields
        if "status" in data:
            booking.status = data["status"]
        if "payment_status" in data:
            booking.payment_status = data["payment_status"]

        s.commit()
        s.refresh(booking)

        return jsonify(_serialize_booking(booking))


@bp.patch("/<uuid:booking_id>")
@require_auth
def update_booking(booking_id):
    """Update booking status"""
    data = request.get_json() or {}

    with SessionLocal() as s:
        booking = s.get(Booking, booking_id)
        if not booking:
            return jsonify({"error": "booking_not_found"}), 404

        # Check ownership
        if str(booking.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Update fields
        if "status" in data:
            booking.status = data["status"]
        if "payment_status" in data:
            booking.payment_status = data["payment_status"]

        s.commit()
        s.refresh(booking)

        return jsonify(_serialize_booking(booking))


@bp.delete("/<uuid:booking_id>")
@require_auth
def cancel_booking(booking_id):
    """Cancel a booking"""
    with SessionLocal() as s:
        booking = s.get(Booking, booking_id)
        if not booking:
            return jsonify({"error": "booking_not_found"}), 404

        # Check ownership
        if str(booking.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Update status to cancelled
        booking.status = "cancelled"
        s.commit()

        return jsonify({"ok": True, "message": "Booking cancelled successfully"})
