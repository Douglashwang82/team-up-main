# app/routes/venues.py
from datetime import datetime, timedelta, date as date_cls
from uuid import UUID

from flask import Blueprint, request, jsonify
from sqlalchemy import and_, select
from app.core.db import SessionLocal
from app.models.venue import Venue, Court, Timeslot
from app.models.booking import Booking
from app.core.types import BookingStatus, PaymentStatus

bp = Blueprint("venues", __name__)

def _serialize_timeslot(ts: Timeslot) -> dict:
    return {
        "id": str(ts.id),
        "court_id": str(ts.court_id),
        "starts_at": ts.starts_at.isoformat() if ts.starts_at else None,
        "ends_at": ts.ends_at.isoformat() if ts.ends_at else None,
        "price_cents": ts.price_cents,
        "currency": ts.currency,
        "is_bookable": bool(ts.is_bookable),
    }

def _serialize_venue(v: Venue) -> dict:
    return {
        "id": str(v.id),
        "name": v.name,
        "address": v.address,
        "city": v.city,
    }

@bp.get("/search")
def search():
    """
    Query params:
      - city: str
      - date: YYYY-MM-DD
      - sport_type: str
    """
    city = request.args.get("city")
    date_str = request.args.get("date")
    sport_type = request.args.get("sport_type")

    with SessionLocal() as s:
        # Query venues with courts and timeslots
        q = s.query(Venue).join(Venue.courts).join(Court.timeslots)

        if city:
            q = q.where(Venue.city.ilike(f"%{city}%"))
        if sport_type:
            q = q.where(Court.sport_type.ilike(f"%{sport_type}%"))
        if date_str:
            try:
                d = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400
            start = datetime.combine(d, datetime.min.time())
            end = start + timedelta(days=1)
            q = q.where(and_(Timeslot.starts_at >= start, Timeslot.starts_at < end))

        venues = q.all()

        # Assemble: return bookable timeslots for each venue
        results = []
        for v in venues:
            timeslots = []
            for court in v.courts:
                for ts in court.timeslots:
                    if ts.is_bookable:
                        timeslots.append(_serialize_timeslot(ts))
            if len(timeslots) > 0:
                results.append({"venue": _serialize_venue(v), "timeslots": timeslots})

        return jsonify(results), 200


@bp.post("/bookings")
def create_booking():
    """
    Body:
      { "timeslot_id": "<uuid-string>", "owner_user_id": "<uuid-string>" }
    """
    data = request.get_json(silent=True) or {}
    timeslot_id = data.get("timeslot_id")
    owner_user_id = data.get("owner_user_id")

    if not timeslot_id:
        return jsonify({"error": "timeslot_id is required"}), 400
    if not owner_user_id:
        return jsonify({"error": "owner_user_id is required"}), 400

    with SessionLocal() as s:
        # Get timeslot
        try:
            ts_uuid = UUID(timeslot_id)
            user_uuid = UUID(owner_user_id)
        except ValueError:
            return jsonify({"error": "Invalid UUID format"}), 400

        ts = s.query(Timeslot).filter(Timeslot.id == ts_uuid).first()
        if not ts or not ts.is_bookable:
            return jsonify({"error": "Timeslot not bookable"}), 400

        # Prevent double booking
        exists = s.query(Booking).filter(Booking.timeslot_id == ts_uuid).first()
        if exists:
            return jsonify({"error": "Timeslot already booked"}), 409

        booking = Booking(
            owner_user_id=user_uuid,
            timeslot_id=ts.id,
            status=BookingStatus.confirmed.value,
            payment_status=PaymentStatus.none.value,
        )
        s.add(booking)

        # Mark timeslot as not bookable
        ts.is_bookable = False
        s.commit()
        s.refresh(booking)

    return jsonify({
        "id": str(booking.id),
        "status": booking.status,
        "payment_status": booking.payment_status
    }), 201
