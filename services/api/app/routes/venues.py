# app/routes/venues.py
from datetime import datetime, timedelta
from uuid import UUID

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

@bp.get("")
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
        # Start with base query - get distinct venues first
        q = select(Venue.id).join(Venue.courts).join(Court.timeslots).distinct()

        # Apply geolocation filter if coordinates provided
        if lat and lng:
            try:
                lat_float = float(lat)
                lng_float = float(lng)
                distance_meters = float(distance)
            except ValueError:
                return jsonify({"error": "Invalid lat, lng, or distance values"}), 400

            # Create a point in WGS84 (SRID 4326)
            point = WKTElement(f'POINT({lng_float} {lat_float})', srid=4326)

            # Filter venues within distance
            q = q.where(
                ST_DWithin(
                    Venue.geo_point,
                    point,
                    distance_meters,
                    True  # Use spheroid for accurate distance calculation
                )
            )

        # Apply sport type filter
        if sport_type:
            q = q.where(Court.sport_type.ilike(f"%{sport_type}%"))

        # Apply datetime filter
        if datetime_str:
            try:
                # Try to parse as datetime first
                if 'T' in datetime_str or ' ' in datetime_str:
                    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                    # Look for timeslots within 2 hours of requested time
                    start_time = dt - timedelta(hours=1)
                    end_time = dt + timedelta(hours=3)
                    q = q.where(and_(
                        Timeslot.starts_at >= start_time,
                        Timeslot.starts_at <= end_time
                    ))
                else:
                    # Parse as date only
                    dt = datetime.strptime(datetime_str, "%Y-%m-%d")
                    start_of_day = dt.replace(hour=0, minute=0, second=0)
                    end_of_day = start_of_day + timedelta(days=1)
                    q = q.where(and_(
                        Timeslot.starts_at >= start_of_day,
                        Timeslot.starts_at < end_of_day
                    ))
            except ValueError:
                return jsonify({"error": "Invalid datetime format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS"}), 400
        else:
            # No datetime filter - only show bookable timeslots
            q = q.where(Timeslot.is_bookable == True)

        # Get venue IDs that match criteria
        venue_ids = s.execute(q).scalars().all()
        
        if not venue_ids:
            return jsonify([]), 200

        # Now get the actual venues with distance calculation if needed
        if lat and lng:
            lat_float = float(lat)
            lng_float = float(lng)
            point = WKTElement(f'POINT({lng_float} {lat_float})', srid=4326)
            
            # Query venues with distance
            venues_query = select(
                Venue,
                ST_Distance(Venue.geo_point, point).label('distance')
            ).where(
                Venue.id.in_(venue_ids)
            ).order_by(ST_Distance(Venue.geo_point, point))
            
            venue_results = s.execute(venues_query).all()
        else:
            # Query venues without distance
            venues_query = select(Venue).where(Venue.id.in_(venue_ids))
            venues = s.execute(venues_query).scalars().all()
            venue_results = [(venue, None) for venue in venues]

        # Assemble results with timeslots
        results = []
        for venue_result in venue_results:
            if lat and lng:
                v = venue_result[0]  # venue object
                distance = venue_result[1]  # distance
            else:
                v = venue_result[0]  # venue object
                distance = venue_result[1]  # None

            # Get all bookable timeslots for this venue
            timeslots_query = select(Timeslot).join(Court).where(
                Court.venue_id == v.id,
                Timeslot.is_bookable == True
            )
            
            # Apply datetime filter to timeslots if specified
            if datetime_str:
                try:
                    if 'T' in datetime_str or ' ' in datetime_str:
                        dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                        start_time = dt - timedelta(hours=1)
                        end_time = dt + timedelta(hours=3)
                        timeslots_query = timeslots_query.where(and_(
                            Timeslot.starts_at >= start_time,
                            Timeslot.starts_at <= end_time
                        ))
                    else:
                        dt = datetime.strptime(datetime_str, "%Y-%m-%d")
                        start_of_day = dt.replace(hour=0, minute=0, second=0)
                        end_of_day = start_of_day + timedelta(days=1)
                        timeslots_query = timeslots_query.where(and_(
                            Timeslot.starts_at >= start_of_day,
                            Timeslot.starts_at < end_of_day
                        ))
                except ValueError:
                    pass  # Already handled above

            # Apply sport type filter to timeslots
            if sport_type:
                timeslots_query = timeslots_query.where(
                    Court.sport_type.ilike(f"%{sport_type}%")
                )

            timeslots = s.execute(timeslots_query.order_by(Timeslot.starts_at)).scalars().all()
            
            if timeslots:  # Only include venues with available timeslots
                venue_data = {
                    "venue": _serialize_venue(v),
                    "timeslots": [_serialize_timeslot(ts) for ts in timeslots]
                }
                
                if distance is not None:
                    venue_data["distance_meters"] = round(float(distance), 2)
                
                results.append(venue_data)

        return jsonify(results), 200


@bp.get("/<uuid:venue_id>")
def get_venue_by_id(venue_id):
    """Get venue details by its id"""
    with SessionLocal() as s:
        venue = s.get(Venue, venue_id)
        if not venue:
            return jsonify({"error": "Venue not found"}), 404

        courts = s.execute(
            select(Court).where(Court.venue_id == venue_id)
        ).scalars().all()

        court_list = []
        for court in courts:
            court_data = {
                "id": str(court.id),
                "name": court.name,
                "sport_type": court.sport_type,
                "venue_id": str(court.venue_id)
            }
            court_list.append(court_data)

        return jsonify({
            "venue": _serialize_venue(venue),
            "courts": court_list
        }), 200


@bp.get("/<uuid:venue_id>/courts/<uuid:court_id>/timeslots")
def get_court_timeslots(venue_id, court_id):
    """Get available timeslots for a court"""
    date_str = request.args.get("date")

    with SessionLocal() as s:
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404

        query = select(Timeslot).where(Timeslot.court_id == court_id)

        if date_str:
            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
                start_of_day = dt.replace(hour=0, minute=0, second=0)
                end_of_day = start_of_day + timedelta(days=1)
                query = query.where(and_(
                    Timeslot.starts_at >= start_of_day,
                    Timeslot.starts_at < end_of_day
                ))
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        timeslots = s.execute(
            query.where(Timeslot.is_bookable == True).order_by(Timeslot.starts_at)
        ).scalars().all()

        return jsonify([_serialize_timeslot(ts) for ts in timeslots]), 200
