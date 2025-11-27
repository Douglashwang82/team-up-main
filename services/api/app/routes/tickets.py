from flask import Blueprint, request, jsonify
from app.core.db import get_db
from app.models import Ticket
from app.services.matching_service import MatchingService
from app.core.auth import require_auth
from datetime import datetime, time

bp = Blueprint("tickets", __name__, url_prefix="/tickets")

@bp.route("", methods=["POST"])
@require_auth
def create_ticket(user_id):
    data = request.get_json()
    
    # Validate data (basic validation)
    required_fields = ["date", "start_time", "duration_minutes", "sport_type", "intensity"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

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

    with get_db() as db:
        ticket = Ticket(
            user_id=user_id,
            date=date_obj,
            start_time=time_obj,
            duration_minutes=data["duration_minutes"],
            sport_type=data["sport_type"],
            intensity=data["intensity"],
            venue_ids=data.get("venue_ids"),
            price_min=data.get("price_min"),
            price_max=data.get("price_max"),
            currency=data.get("currency", "USD")
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        
        # Trigger matching
        service = MatchingService(db)
        service.process_ticket(ticket)
        
        return jsonify({
            "id": ticket.id,
            "status": ticket.status,
            "message": "Ticket created and matching started"
        }), 201

@bp.route("", methods=["GET"])
@require_auth
def get_tickets(user_id):
    with get_db() as db:
        tickets = db.query(Ticket).filter(Ticket.user_id == user_id).all()
        return jsonify([{
            "id": t.id,
            "date": t.date.isoformat(),
            "start_time": t.start_time.isoformat(),
            "sport_type": t.sport_type,
            "status": t.status,
            "created_at": t.created_at.isoformat()
        } for t in tickets])
