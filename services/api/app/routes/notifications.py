from flask import Blueprint, jsonify, g
from sqlalchemy import select, desc, and_

from app.core.db import SessionLocal
from app.models import Notification
from app.core.auth import require_auth

bp = Blueprint("notifications", __name__, url_prefix="/notifications")

@bp.route("", methods=["GET"])
@require_auth
def get_notifications():
    if g.user_id is None:
        return jsonify({"error": "authentication_required"}), 401

    with SessionLocal() as s:
        notifications = s.execute(
            select(Notification)
            .where(Notification.user_id == g.user_id)
            .order_by(desc(Notification.created_at))
        ).scalars().all()
        
        return jsonify([{
            "id": str(n.id),
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "related_entity_id": str(n.related_entity_id) if n.related_entity_id else None,
            "related_entity_type": n.related_entity_type,
            "created_at": n.created_at.isoformat()
        } for n in notifications])

@bp.route("/<uuid:notification_id>/read", methods=["POST"])
@require_auth
def mark_as_read(notification_id):
    if g.user_id is None:
        return jsonify({"error": "authentication_required"}), 401

    with SessionLocal() as s:
        notification = s.execute(
            select(Notification).where(
                and_(
                    Notification.id == notification_id,
                    Notification.user_id == g.user_id
                )
            )
        ).scalar_one_or_none()
        
        if not notification:
            return jsonify({"error": "notification_not_found"}), 404
            
        notification.is_read = True
        s.commit()
        
        return jsonify({"message": "Marked as read"})
