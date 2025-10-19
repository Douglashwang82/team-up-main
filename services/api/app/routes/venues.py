# app/routes/venues.py
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from sqlalchemy import and_, select, func
from app.core.db import SessionLocal
from app.models.venue import Venue, Court, Timeslot
from geoalchemy2.functions import ST_DWithin, ST_Distance
from geoalchemy2.elements import WKTElement

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

@bp.get("/venues")
def get_venues():
    """
    Query params:
      - lat: latitude (required if using distance)
      - lng: longitude (required if using distance)
      - distance: distance in meters (optional, default: 5000m = 5km)
      - datetime: ISO datetime string (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DD)
      - sport_type: str
    """
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    distance = request.args.get("distance", "5000")  # Default 5km
    datetime_str = request.args.get("datetime")
    sport_type = request.args.get("sport_type")

    with SessionLocal() as s:
        # Start with base query
        q = select(Venue).join(Venue.courts).join(Court.timeslots)

        # Apply geolocation filter if coordinates provided
        if lat and lng:
            try:
                lat_float = float(lat)
                lng_float = float(lng)
                distance_meters = float(distance)
            except ValueError:
                return jsonify({"error": "Invalid lat, lng, or distance format"}), 400

            # Create a point in WGS84 (SRID 4326)
            point = WKTElement(f'POINT({lng_float} {lat_float})', srid=4326)

            # Filter venues within distance
            q = q.where(
                ST_DWithin(
                    Venue.geo_point,
                    point,
                    distance_meters,
                    True  # Use sphere for accurate distance
                )
            )

        # Apply sport type filter
        if sport_type:
            q = q.where(Court.sport_type.ilike(f"%{sport_type}%"))

        # Apply datetime filter
        if datetime_str:
            try:
                # Try parsing with time first, then fall back to date only
                if 'T' in datetime_str or ' ' in datetime_str:
                    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                else:
                    # Date only - search for entire day
                    d = datetime.strptime(datetime_str, "%Y-%m-%d").date()
                    dt = datetime.combine(d, datetime.min.time())
            except ValueError:
                return jsonify({"error": "Invalid datetime format, expected ISO format (YYYY-MM-DDTHH:MM:SS) or YYYY-MM-DD"}), 400

            # If only date provided, search entire day
            if 'T' not in datetime_str and ' ' not in datetime_str:
                end = dt + timedelta(days=1)
                q = q.where(and_(
                    Timeslot.starts_at >= dt,
                    Timeslot.starts_at < end,
                    Timeslot.is_bookable == True
                ))
            else:
                # Specific datetime - find timeslots that contain this time
                q = q.where(and_(
                    Timeslot.starts_at <= dt,
                    Timeslot.ends_at > dt,
                    Timeslot.is_bookable == True
                ))
        else:
            # No datetime filter - only show bookable timeslots
            q = q.where(Timeslot.is_bookable == True)

        # Add distance calculation to results if coordinates provided
        if lat and lng:
            lat_float = float(lat)
            lng_float = float(lng)
            point = WKTElement(f'POINT({lng_float} {lat_float})', srid=4326)

            # Order by distance
            q = q.order_by(
                ST_Distance(Venue.geo_point, point, True)
            )

        venues = s.execute(q).scalars().unique().all()

        # Assemble results with timeslots
        results = []
        for v in venues:
            timeslots = []
            for court in v.courts:
                # Apply sport type filter to court if needed
                if sport_type and not (court.sport_type and sport_type.lower() in court.sport_type.lower()):
                    continue

                for ts in court.timeslots:
                    # Apply datetime and bookable filters
                    if not ts.is_bookable:
                        continue

                    if datetime_str:
                        try:
                            if 'T' in datetime_str or ' ' in datetime_str:
                                dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                                if not (ts.starts_at <= dt < ts.ends_at):
                                    continue
                            else:
                                d = datetime.strptime(datetime_str, "%Y-%m-%d").date()
                                start = datetime.combine(d, datetime.min.time())
                                end = start + timedelta(days=1)
                                if not (start <= ts.starts_at < end):
                                    continue
                        except ValueError:
                            continue

                    timeslot_data = _serialize_timeslot(ts)
                    timeslot_data["court_name"] = court.name
                    timeslot_data["sport_type"] = court.sport_type
                    timeslots.append(timeslot_data)

            if len(timeslots) > 0:
                venue_data = _serialize_venue(v)

                # Add distance if coordinates provided
                if lat and lng:
                    lat_float = float(lat)
                    lng_float = float(lng)
                    point = WKTElement(f'POINT({lng_float} {lat_float})', srid=4326)

                    distance_result = s.execute(
                        select(ST_Distance(Venue.geo_point, point, True))
                        .where(Venue.id == v.id)
                    ).scalar()

                    venue_data["distance_meters"] = round(distance_result, 2) if distance_result else None

                results.append({
                    "venue": venue_data,
                    "timeslots": timeslots
                })

        return jsonify(results), 200


@bp.get("/<uuid:venue_id>")
def get_venue_by_id(venue_id):
    """Get venue details by its id"""
    with SessionLocal() as s:
        venue = s.get(Venue, venue_id)
        if not venue:
            return jsonify({"error": "venue_not_found"}), 404

        courts = s.execute(
            select(Court).where(Court.venue_id == venue_id)
        ).scalars().all()

        court_list = []
        for court in courts:
            court_list.append({
                "id": str(court.id),
                "name": court.name,
                "sport_type": court.sport_type,
            })

        return jsonify({
            "id": str(venue.id),
            "name": venue.name,
            "address": venue.address,
            "city": venue.city,
            "contact_phone": venue.contact_phone,
            "partner_code": venue.partner_code,
            "courts": court_list,
            "created_at": venue.created_at.isoformat(),
            "updated_at": venue.updated_at.isoformat(),
        }), 200


@bp.get("/<uuid:venue_id>/courts/<uuid:court_id>/timeslots")
def get_court_timeslots(venue_id, court_id):
    """Get available timeslots for a court"""
    date_str = request.args.get("date")

    with SessionLocal() as s:
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "court_not_found"}), 404

        query = select(Timeslot).where(Timeslot.court_id == court_id)

        if date_str:
            try:
                d = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400
            start = datetime.combine(d, datetime.min.time())
            end = start + timedelta(days=1)
            query = query.where(and_(Timeslot.starts_at >= start, Timeslot.starts_at < end))

        timeslots = s.execute(
            query.where(Timeslot.is_bookable == True).order_by(Timeslot.starts_at)
        ).scalars().all()

        return jsonify([_serialize_timeslot(ts) for ts in timeslots]), 200
