# app/routes/venues.py
from datetime import datetime, timedelta
from uuid import UUID

from flask import Blueprint, request, jsonify
from sqlalchemy import and_, select, func
from app.core.db import SessionLocal
from app.core.auth import require_auth
from app.models.venue import Venue, Court, TimeSlot
from geoalchemy2.functions import ST_DWithin, ST_Distance
from geoalchemy2.elements import WKTElement
from geoalchemy2.shape import to_shape

bp = Blueprint("venues", __name__)

def _serialize_time_slot(ts: TimeSlot) -> dict:
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
        "latitude": v.latitude,
        "longitude": v.longitude,
        "contact_phone": v.contact_phone,
        "partner_code": v.partner_code,
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
        q = select(Venue.id).join(Venue.courts).join(Court.time_slots).distinct()

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
                    # Look for time slots within 2 hours of requested time
                    start_time = dt - timedelta(hours=1)
                    end_time = dt + timedelta(hours=3)
                    q = q.where(and_(
                        TimeSlot.starts_at >= start_time,
                        TimeSlot.starts_at <= end_time
                    ))
                else:
                    # Parse as date only
                    dt = datetime.strptime(datetime_str, "%Y-%m-%d")
                    start_of_day = dt.replace(hour=0, minute=0, second=0)
                    end_of_day = start_of_day + timedelta(days=1)
                    q = q.where(and_(
                        TimeSlot.starts_at >= start_of_day,
                        TimeSlot.starts_at < end_of_day
                    ))
            except ValueError:
                return jsonify({"error": "Invalid datetime format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS"}), 400
        else:
            # No datetime filter - only show bookable time slots
            q = q.where(TimeSlot.is_bookable == True)

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

        # Assemble results with time_slots
        results = []
        for venue_result in venue_results:
            if lat and lng:
                v = venue_result[0]  # venue object
                distance = venue_result[1]  # distance
            else:
                v = venue_result[0]  # venue object
                distance = venue_result[1]  # None

            # Get all bookable time slots for this venue
            time_slots_query = select(TimeSlot).join(Court).where(
                Court.venue_id == v.id,
                TimeSlot.is_bookable == True
            )

            # Apply datetime filter to time slots if specified
            if datetime_str:
                try:
                    if 'T' in datetime_str or ' ' in datetime_str:
                        dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                        start_time = dt - timedelta(hours=1)
                        end_time = dt + timedelta(hours=3)
                        time_slots_query = time_slots_query.where(and_(
                            TimeSlot.starts_at >= start_time,
                            TimeSlot.starts_at <= end_time
                        ))
                    else:
                        dt = datetime.strptime(datetime_str, "%Y-%m-%d")
                        start_of_day = dt.replace(hour=0, minute=0, second=0)
                        end_of_day = start_of_day + timedelta(days=1)
                        time_slots_query = time_slots_query.where(and_(
                            TimeSlot.starts_at >= start_of_day,
                            TimeSlot.starts_at < end_of_day
                        ))
                except ValueError:
                    pass  # Already handled above

            # Apply sport type filter to time slots
            if sport_type:
                time_slots_query = time_slots_query.where(
                    Court.sport_type.ilike(f"%{sport_type}%")
                )

            time_slots = s.execute(time_slots_query.order_by(TimeSlot.starts_at)).scalars().all()

            venue_data = {
                "venue": _serialize_venue(v),
                "time_slots": [_serialize_time_slot(ts) for ts in time_slots]
            }
            
            if distance is not None:
                venue_data["distance_meters"] = round(float(distance), 2)
            
            results.append(venue_data)

        return jsonify(results), 200


@bp.post("")
@require_auth
def create_venue():
    data = request.get_json() or {}
    required = ["name", "address"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": "missing_fields", "fields": missing}), 400
        
    with SessionLocal() as s:
        venue = Venue(
            name=data["name"],
            address=data["address"],
            city=data.get("city"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            contact_phone=data.get("contact_phone"),
            partner_code=data.get("partner_code"),
        )
        s.add(venue)
        s.commit()
        s.refresh(venue)
        
        return jsonify({
            "venue": _serialize_venue(venue),
            "courts": []
        }), 201


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


@bp.put("/<uuid:venue_id>")
@require_auth
def update_venue(venue_id):
    data = request.get_json() or {}
    with SessionLocal() as s:
        venue = s.get(Venue, venue_id)
        if not venue:
            return jsonify({"error": "Venue not found"}), 404
            
        for field in ["name", "address", "city", "latitude", "longitude", "contact_phone", "partner_code"]:
            if field in data:
                setattr(venue, field, data[field])
                
        s.commit()
        s.refresh(venue)
        
        courts = s.execute(select(Court).where(Court.venue_id == venue_id)).scalars().all()
        court_list = [{
            "id": str(c.id),
            "name": c.name,
            "sport_type": c.sport_type,
            "venue_id": str(c.venue_id)
        } for c in courts]
            
        return jsonify({
            "venue": _serialize_venue(venue),
            "courts": court_list
        }), 200


@bp.delete("/<uuid:venue_id>")
@require_auth
def delete_venue(venue_id):
    with SessionLocal() as s:
        venue = s.get(Venue, venue_id)
        if not venue:
            return jsonify({"error": "Venue not found"}), 404
            
        has_courts = s.execute(select(func.count()).select_from(Court).where(Court.venue_id == venue_id)).scalar()
        if has_courts > 0:
            return jsonify({"error": "Cannot delete venue with existing courts"}), 400
            
        s.delete(venue)
        s.commit()
        return jsonify({"ok": True, "message": "Venue deleted successfully"}), 200


@bp.get("/<uuid:venue_id>/courts/<uuid:court_id>")
def get_court(venue_id, court_id):
    """Get court details"""
    with SessionLocal() as s:
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404

        return jsonify({
            "id": str(court.id),
            "name": court.name,
            "sport_type": court.sport_type,
            "venue_id": str(court.venue_id)
        }), 200


@bp.put("/<uuid:venue_id>/courts/<uuid:court_id>")
def update_court(venue_id, court_id):
    """Update court details"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body required"}), 400

    with SessionLocal() as s:
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404

        if "name" in data:
            court.name = data["name"]
        if "sport_type" in data:
            court.sport_type = data["sport_type"]

        s.commit()
        s.refresh(court)

        return jsonify({
            "id": str(court.id),
            "name": court.name,
            "sport_type": court.sport_type,
            "venue_id": str(court.venue_id)
        }), 200


@bp.delete("/<uuid:venue_id>/courts/<uuid:court_id>")
def delete_court(venue_id, court_id):
    """Delete a court"""
    with SessionLocal() as s:
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404

        # Check if court has time slots
        has_slots = s.execute(
            select(func.count()).select_from(TimeSlot).where(TimeSlot.court_id == court_id)
        ).scalar()
        
        if has_slots > 0:
             return jsonify({"error": "Cannot delete court with existing time slots"}), 400

        s.delete(court)
        s.commit()

        return jsonify({"message": "Court deleted successfully"}), 200


@bp.get("/<uuid:venue_id>/courts/<uuid:court_id>/time_slots")
def get_court_time_slots(venue_id, court_id):
    """Get available time slots for a court"""
    date_str = request.args.get("date")

    with SessionLocal() as s:
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404

        query = select(TimeSlot).where(TimeSlot.court_id == court_id)

        if date_str:
            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
                start_of_day = dt.replace(hour=0, minute=0, second=0)
                end_of_day = start_of_day + timedelta(days=1)
                query = query.where(and_(
                    TimeSlot.starts_at >= start_of_day,
                    TimeSlot.starts_at < end_of_day
                ))
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        time_slots = s.execute(
            query.where(TimeSlot.is_bookable == True).order_by(TimeSlot.starts_at)
        ).scalars().all()

        return jsonify([_serialize_time_slot(ts) for ts in time_slots]), 200


@bp.post("/<uuid:venue_id>/courts/<uuid:court_id>/time_slots")
def create_time_slots(venue_id, court_id):
    """Create time slot(s) for a court. Supports both single and multiple time slot creation.

    Single time slot body:
        starts_at (str): The start time of the time slot
        ends_at (str): The end time of the time slot
        price_cents (int, optional): The price of the time slot in cents
        currency (str, optional): The currency of the time slot
        is_bookable (bool, optional): Whether the time slot is bookable

    Multiple time slots body:
        time_slots (list): A list of time slots
        time_slots[i].starts_at (str): The start time of the time slot
        time_slots[i].ends_at (str): The end time of the time slot
        time_slots[i].price_cents (int, optional): The price of the time slot in cents
        time_slots[i].currency (str, optional): The currency of the time slot
        time_slots[i].is_bookable (bool, optional): Whether the time slot is bookable

    Args:
        venue_id (uuid): The ID of the venue
        court_id (uuid): The ID of the court

    Returns:
        A single time slot object or a list of time slots
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body required"}), 400

    with SessionLocal() as s:
        # Verify court exists and belongs to venue
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404

        # Determine if single or multiple time slots
        if "time_slots" in data:
            # Multiple time slots creation
            time_slots_data = data["time_slots"]
            if not isinstance(time_slots_data, list) or len(time_slots_data) == 0:
                return jsonify({"error": "time_slots must be a non-empty list"}), 400
        elif "starts_at" in data and "ends_at" in data:
            # Single time slot creation
            time_slots_data = [data]
        else:
            return jsonify({"error": "Either provide 'time_slots' array or 'starts_at' and 'ends_at' fields"}), 400

        # Create time slots
        created_slots = []
        for time_slot_data in time_slots_data:
            try:
                starts_at = datetime.fromisoformat(time_slot_data["starts_at"].replace('Z', '+00:00'))
                ends_at = datetime.fromisoformat(time_slot_data["ends_at"].replace('Z', '+00:00'))

                # Validate time range
                if ends_at <= starts_at:
                    return jsonify({"error": "ends_at must be after starts_at"}), 400

                # Check overlap
                existing_time_slots = s.execute(
                    select(TimeSlot)
                    .where(TimeSlot.court_id == court_id)
                    .where(TimeSlot.starts_at < ends_at)
                    .where(TimeSlot.ends_at > starts_at)
                ).scalars().all()

                if existing_time_slots:
                    return jsonify({"error": "Time slot overlaps with existing time slots"}), 400

                # Create time slot
                time_slot = TimeSlot(
                    court_id=court_id,
                    starts_at=starts_at,
                    ends_at=ends_at,
                    price_cents=time_slot_data.get("price_cents"),
                    currency=time_slot_data.get("currency", "USD"),
                    is_bookable=time_slot_data.get("is_bookable", True)
                )

                s.add(time_slot)
                s.commit()
                s.refresh(time_slot)

                created_slots.append(_serialize_time_slot(time_slot))

            except ValueError as e:
                s.rollback()
                return jsonify({"error": f"Invalid datetime format: {str(e)}"}), 400
            except Exception as e:
                s.rollback()
                return jsonify({"error": f"Failed to create time slot: {str(e)}"}), 500

        # Return single object if single creation, list if multiple
        if "time_slots" in data:
            return jsonify(created_slots), 201
        else:
            return jsonify(created_slots[0]), 201

@bp.get("/<uuid:venue_id>/courts/<uuid:court_id>/time_slots/<uuid:time_slot_id>")
def get_time_slot(venue_id, court_id, time_slot_id):
    """Get a single time slot"""
    with SessionLocal() as s:
        # Verify court exists and belongs to venue
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404
        
        # Get time slot
        time_slot = s.get(TimeSlot, time_slot_id)
        if not time_slot or time_slot.court_id != court_id:
            return jsonify({"error": "Time slot not found"}), 404

        return jsonify(_serialize_time_slot(time_slot)), 200


@bp.put("/<uuid:venue_id>/courts/<uuid:court_id>/time_slots/<uuid:time_slot_id>")
@bp.patch("/<uuid:venue_id>/courts/<uuid:court_id>/time_slots/<uuid:time_slot_id>")
def update_time_slot(venue_id, court_id, time_slot_id):
    """Update a time slot"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body required"}), 400
    
    with SessionLocal() as s:
        # Verify court exists and belongs to venue
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404
        
        # Get time slot
        time_slot = s.get(TimeSlot, time_slot_id)
        if not time_slot or time_slot.court_id != court_id:
            return jsonify({"error": "Time slot not found"}), 404
        
        try:
            # Update fields if provided
            if "starts_at" in data:
                time_slot.starts_at = datetime.fromisoformat(data["starts_at"].replace('Z', '+00:00'))
            
            if "ends_at" in data:
                time_slot.ends_at = datetime.fromisoformat(data["ends_at"].replace('Z', '+00:00'))
            
            # Validate time range
            if time_slot.ends_at <= time_slot.starts_at:
                return jsonify({"error": "ends_at must be after starts_at"}), 400
            
            if "price_cents" in data:
                time_slot.price_cents = data["price_cents"]
            
            if "currency" in data:
                time_slot.currency = data["currency"]
            
            if "is_bookable" in data:
                time_slot.is_bookable = data["is_bookable"]
            
            s.commit()
            s.refresh(time_slot)
            
            return jsonify(_serialize_time_slot(time_slot)), 200
            
        except ValueError as e:
            return jsonify({"error": f"Invalid datetime format: {str(e)}"}), 400
        except Exception as e:
            s.rollback()
            return jsonify({"error": f"Failed to update time slot: {str(e)}"}), 500


@bp.delete("/<uuid:venue_id>/courts/<uuid:court_id>/time_slots/<uuid:time_slot_id>")
def delete_time_slot(venue_id, court_id, time_slot_id):
    """Delete a time slot"""
    with SessionLocal() as s:
        # Verify court exists and belongs to venue
        court = s.get(Court, court_id)
        if not court or court.venue_id != venue_id:
            return jsonify({"error": "Court not found"}), 404
        
        # Get time slot
        time_slot = s.get(TimeSlot, time_slot_id)
        if not time_slot or time_slot.court_id != court_id:
            return jsonify({"error": "Time slot not found"}), 404
        
        # Check if time slot has bookings
        if time_slot.bookings:
            return jsonify({"error": "Cannot delete time slot with existing bookings"}), 400
        
        try:
            s.delete(time_slot)
            s.commit()
            
            return jsonify({"message": "Time slot deleted successfully"}), 200
            
        except Exception as e:
            s.rollback()
            return jsonify({"error": f"Failed to delete time slot: {str(e)}"}), 500
