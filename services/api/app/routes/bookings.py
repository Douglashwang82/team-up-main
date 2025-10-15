# app/routes/bookings.py
from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, and_
from datetime import datetime
from uuid import UUID

from app.core.db import SessionLocal
from app.core.auth import require_auth
from app.models.booking import Booking
from app.models.venue import Venue, Court, Timeslot
from app.models.teamup import TeamUp

bp = Blueprint("bookings", __name__)


def _serialize_booking(booking: Booking) -> dict:
    """Serialize booking to dict"""
    return {
        "id": str(booking.id),
        "owner_user_id": str(booking.owner_user_id),
        "timeslot_id": str(booking.timeslot_id),
        "teamup_id": str(booking.teamup_id) if booking.teamup_id else None,
        "status": booking.status,
        "payment_status": booking.payment_status,
        "created_at": booking.created_at.isoformat(),
        "updated_at": booking.updated_at.isoformat(),
    }


def _serialize_booking_detail(booking: Booking, timeslot: Timeslot, court: Court, venue: Venue, teamup: TeamUp | None = None) -> dict:
    """Serialize booking detail with related data"""
    return {
        "id": str(booking.id),
        "owner_user_id": str(booking.owner_user_id),
        "timeslot_id": str(booking.timeslot_id),
        "teamup_id": str(booking.teamup_id) if booking.teamup_id else None,
        "status": booking.status,
        "payment_status": booking.payment_status,
        "timeslot": {
            "id": str(timeslot.id),
            "starts_at": timeslot.starts_at.isoformat(),
            "ends_at": timeslot.ends_at.isoformat(),
            "price_cents": timeslot.price_cents,
            "currency": timeslot.currency,
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
        "teamup": {
            "id": str(teamup.id),
            "title": teamup.title,
            "description": teamup.description,
        } if teamup else None,
        "created_at": booking.created_at.isoformat(),
        "updated_at": booking.updated_at.isoformat(),
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
        timeslot = s.get(Timeslot, booking.timeslot_id)
        if not timeslot:
            return jsonify({"error": "timeslot_not_found"}), 404

        court = s.get(Court, timeslot.court_id)
        if not court:
            return jsonify({"error": "court_not_found"}), 404

        venue = s.get(Venue, court.venue_id)
        if not venue:
            return jsonify({"error": "venue_not_found"}), 404

        # Get teamup if booking is associated with one
        teamup = None
        if booking.teamup_id:
            teamup = s.get(TeamUp, booking.teamup_id)

        return jsonify(_serialize_booking_detail(booking, timeslot, court, venue, teamup))
