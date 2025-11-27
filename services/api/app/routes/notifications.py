from flask import Blueprint, jsonify
from app.core.db import get_db
from app.models import Notification
from app.core.auth import require_auth

bp = Blueprint("notifications", __name__, url_prefix="/notifications")

@bp.route("", methods=["GET"])
@require_auth
def get_notifications(user_id):
    with get_db() as db:
        notifications = db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).all()
        
        return jsonify([{
            "id": n.id,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "related_entity_id": n.related_entity_id,
            "related_entity_type": n.related_entity_type,
            "created_at": n.created_at.isoformat()
        } for n in notifications])

@bp.route("/<uuid:notification_id>/read", methods=["POST"])
@require_auth
def mark_as_read(user_id, notification_id):
    with get_db() as db:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            return jsonify({"error": "Notification not found"}), 404
            
        notification.is_read = True
        db.commit()
        
        return jsonify({"message": "Marked as read"})
