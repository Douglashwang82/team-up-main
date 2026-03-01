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
            "related_event_ids": [str(eid) for eid in n.related_event_ids] if n.related_event_ids else [],
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

@bp.get("/<uuid:notification_id>")
@require_auth
def get_notification(notification_id):
    with SessionLocal() as s:
        n = s.get(Notification, notification_id)
        if not n or str(n.user_id) != str(g.user_id):
            return jsonify({"error": "notification_not_found"}), 404
            
        return jsonify({
            "id": str(n.id),
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "related_event_ids": [str(eid) for eid in n.related_event_ids] if n.related_event_ids else [],
            "created_at": n.created_at.isoformat()
        })

@bp.delete("/<uuid:notification_id>")
@require_auth
def delete_notification(notification_id):
    with SessionLocal() as s:
        n = s.get(Notification, notification_id)
        if not n or str(n.user_id) != str(g.user_id):
            return jsonify({"error": "notification_not_found"}), 404
            
        s.delete(n)
        s.commit()
        return jsonify({"ok": True, "message": "Notification deleted successfully"})
