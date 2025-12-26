from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, desc
from datetime import datetime

from app.core.db import SessionLocal
from app.models import Ticket
from app.services.matching_service import process_ticket, find_existing_events
from app.core.auth import require_auth

bp = Blueprint("tickets", __name__, url_prefix="/tickets")

@bp.route("", methods=["POST"])
@require_auth
def create_ticket():
    data = request.get_json() or {}
    
    # Validate data (basic validation)
    required_fields = ["date", "start_time", "duration_minutes", "sport_type", "intensity", "venue_ids"]
    missing = [k for k in required_fields if k not in data]
    if missing:
        return jsonify({"error": "missing_fields", "fields": missing}), 400
    
    # Validate venue_ids is a non-empty list
    if not isinstance(data["venue_ids"], list) or len(data["venue_ids"]) == 0:
        return jsonify({"error": "venue_ids must be a non-empty list"}), 400

    if g.user_id is None:
        return jsonify({"error": "authentication_required"}), 401

    try:
        # Handle Date (YYYY-MM-DD or ISO)
        date_str = data["date"]
        if "T" in date_str:
            date_str = date_str.split("T")[0]
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()

        # Handle Time (HH:MM or HH:MM:SS)
        time_str = data["start_time"]
        if len(time_str.split(":")) == 2:
            time_obj = datetime.strptime(time_str, "%H:%M").time()
        else:
            time_obj = datetime.strptime(time_str, "%H:%M:%S").time()
    except ValueError:
        return jsonify({"error": "Invalid date or time format"}), 400

    with SessionLocal() as s:
        ticket = Ticket(
            user_id=g.user_id,
            date=date_obj,
            start_time=time_obj,
            duration_minutes=data["duration_minutes"],
            sport_type=data["sport_type"],
            intensity=data["intensity"],
            venue_ids=data["venue_ids"],
            price_min=data.get("price_min"),
            price_max=data.get("price_max"),
            currency=data.get("currency", "USD")
        )
        s.add(ticket)
        s.commit()
        s.refresh(ticket)
        
        # Trigger matching
        process_ticket(s, ticket)
        
        return jsonify({
            "id": str(ticket.id),
            "status": ticket.status,
            "message": "Ticket created and matching started"
        }), 201

@bp.route("", methods=["GET"])
@require_auth
def get_tickets():
    if g.user_id is None:
        return jsonify({"error": "authentication_required"}), 401

    with SessionLocal() as s:
        tickets = s.execute(
            select(Ticket)
            .where(Ticket.user_id == g.user_id)
            .order_by(desc(Ticket.created_at))
        ).scalars().all()

        return jsonify([{
            "id": str(t.id),
            "date": t.date.isoformat(),
            "start_time": t.start_time.isoformat(),
            "sport_type": t.sport_type,
            "status": t.status,
            "created_at": t.created_at.isoformat()
        } for t in tickets])

@bp.route("/<uuid:ticket_id>", methods=["GET"])
@require_auth
def get_ticket(ticket_id):
    if g.user_id is None:
        return jsonify({"error": "authentication_required"}), 401

    with SessionLocal() as s:
        ticket = s.get(Ticket, ticket_id)
        
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404
            
        if str(ticket.user_id) != str(g.user_id):
            return jsonify({"error": "Unauthorized"}), 403

        # Find matching events
        matched_events = find_existing_events(s, ticket)
        
        return jsonify({
            "id": str(ticket.id),
            "date": ticket.date.isoformat(),
            "start_time": ticket.start_time.isoformat(),
            "duration_minutes": ticket.duration_minutes,
            "sport_type": ticket.sport_type,
            "intensity": ticket.intensity,
            "venue_ids": ticket.venue_ids,
            "price_min": ticket.price_min,
            "price_max": ticket.price_max,
            "currency": ticket.currency,
            "status": ticket.status,
            "created_at": ticket.created_at.isoformat(),
            "matched_events": [{
                "id": str(e.id),
                "title": e.title,
                "description": e.description,
                "status": e.status,
                "start_time": e.bookings[0].time_slot.starts_at.isoformat() if e.bookings else None
            } for e in matched_events]
        })