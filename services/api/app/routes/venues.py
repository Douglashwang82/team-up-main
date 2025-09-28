# app/routes/venues.py
from datetime import datetime, timedelta, date as date_cls
from uuid import UUID

from flask import Blueprint, request, jsonify
from sqlalchemy import and_, select
from app.core.db import SessionLocal
from app.models.venue import Venue, VenueTimeslot
from app.models.booking import Booking
from app.core.types import BookingStatus, PaymentStatus

bp = Blueprint("venues", __name__)

def _serialize_timeslot(ts: VenueTimeslot) -> dict:
    return {
        "id": str(ts.id),
        "venue_id": str(ts.venue_id),
        "starts_at": ts.starts_at.isoformat() if ts.starts_at else None,
        "ends_at": ts.ends_at.isoformat() if ts.ends_at else None,
        "sport_type": ts.sport_type,
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
        q = s.query(Venue).join(Venue.timeslots)
        if city:
            q = q.where(Venue.city.ilike(f"%{city}%"))
        if sport_type:
            q = q.where(VenueTimeslot.sport_type.ilike(f"%{sport_type}%"))
        if date_str:
            try:
                d = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400
            start = datetime.combine(d, datetime.min.time())
            end = start + timedelta(days=1)
            q = q.where(and_(VenueTimeslot.starts_at >= start, VenueTimeslot.starts_at < end))

    venues = q.all()
    # 組裝：每個場地回傳可預約時段（is_bookable=True）
    results = []
    for v in venues:
        timeslots = [_serialize_timeslot(ts) for ts in v.timeslots if ts.is_bookable]
        if timeslots:
            results.append({"venue": _serialize_venue(v), "timeslots": timeslots})

    return jsonify(results), 200


@bp.post("/bookings")
def create_booking():
    """
    Body:
      { "timeslot_id": "<uuid-string>" }
    """
    data = request.get_json(silent=True) or {}
    timeslot_id = data.get("timeslot_id")
    if not timeslot_id:
        return jsonify({"error": "timeslot_id is required"}), 400

    # 這裡先不強制使用者登入，保留 user_id=None；若你要，從 session/jwt 取出 user_id
    user_id = None

    with SessionLocal() as s:
        # 取時段
        try:
            ts_uuid = UUID(timeslot_id)
        except ValueError:
            return jsonify({"error": "Invalid timeslot_id"}), 400
        
        q = s.query(VenueTimeslot).filter(VenueTimeslot.id == ts_uuid)
        ts = q.first()
        if not q or not q.first().is_bookable:
            return jsonify({"error": "Timeslot not bookable"}), 400

        # 防雙重預約（DB 層有 UNIQUE(timeslot_id)，此處先行檢查）
        exists = s.query(Booking).filter(
            and_(
                Booking.timeslot_id == ts_uuid,
            )).first()
        if exists:
            return jsonify({"error": "Timeslot already booked"}), 409

        booking = Booking(
            user_id=user_id,
            venue_id=ts.venue_id,
            timeslot_id=ts.id,
            status=BookingStatus.confirmed.value,      # 金流上線前先直接 confirmed
            payment_status=PaymentStatus.none.value,   # 之後串接金流可 pending→succeeded
        )
        s.add(booking)
        # 預約成功後，該時段不可再被預約
        ts.is_bookable = False
        s.commit()
        s.refresh(booking)

    return jsonify({
        "id": str(booking.id),
        "status": booking.status,
        "payment_status": booking.payment_status
    }), 201
