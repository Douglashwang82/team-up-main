from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from app.core.db import SessionLocal
from app.models.event import Event, EventParticipants
from app.core.auth import require_auth

bp = Blueprint("events", __name__)

def _parse_dt(s: str):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))

@bp.get("")
def list_events():
    try:
        lat = float(request.args["lat"])
        lng = float(request.args["lng"])
    except Exception:
        return jsonify({"error": "lat_lng_required"}), 400
    radius_km = float(request.args.get("radius", 5))
    sport = request.args.get("sport")
    start = request.args.get("start")
    end   = request.args.get("end")
    limit = min(int(request.args.get("limit", 50)), 200)
    offset = max(int(request.args.get("offset", 0)), 0)

    with SessionLocal() as s:
        point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
        q = select(Event).where(func.ST_DWithin(Event.location, point, radius_km * 1000))
        if sport: q = q.where(Event.sport == sport)
        if start: q = q.where(Event.starts_at >= _parse_dt(start))
        if end:   q = q.where(Event.ends_at   <= _parse_dt(end))
        rows = s.execute(q.order_by(Event.starts_at.asc()).offset(offset).limit(limit)).scalars().all()

        ids = [e.id for e in rows]
        counts = {}
        if ids:
            cnt_rows = s.execute(select(EventParticipants.c.event_id, func.count())
                                 .where(EventParticipants.c.event_id.in_(ids))
                                 .group_by(EventParticipants.c.event_id)).all()
            counts = {r[0]: r[1] for r in cnt_rows}

        def _to_dict(e: Event):
            return {
                "id": str(e.id),
                "title": e.title,
                "sport": e.sport,
                "starts_at": e.starts_at.isoformat(),
                "ends_at": e.ends_at.isoformat(),
                "capacity": e.capacity,
                "attending": counts.get(e.id, 0),
                "address": e.address,
            }
        return jsonify([_to_dict(e) for e in rows])

@bp.get("/<uuid:event_id>")
def get_event(event_id):
    with SessionLocal() as s:
        e = s.get(Event, event_id)
        if not e:
            return jsonify({"error": "not_found"}), 404
        attending = s.scalar(select(func.count()).select_from(EventParticipants)
                             .where(EventParticipants.c.event_id == event_id)) or 0
        return jsonify({
            "id": str(e.id),
            "title": e.title,
            "sport": e.sport,
            "starts_at": e.starts_at.isoformat(),
            "ends_at": e.ends_at.isoformat(),
            "capacity": e.capacity,
            "attending": attending,
            "host_id": str(e.host_id) if e.host_id else None,
            "address": e.address,
        })

@bp.post("")
@require_auth
def create_event():
    data = request.get_json() or {}
    required = ["title","sport","starts_at","ends_at","capacity","lat","lng"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": "missing_fields", "fields": missing}), 400
    with SessionLocal() as s:
        e = Event(
            title=data["title"], sport=data["sport"],
            starts_at=_parse_dt(data["starts_at"]), ends_at=_parse_dt(data["ends_at"]),
            capacity=int(data["capacity"]), address=data.get("address"),
            host_id=g.user_id,
            location=func.ST_SetSRID(func.ST_MakePoint(float(data["lng"]), float(data["lat"])), 4326)
        )
        s.add(e)
        s.commit(); s.refresh(e)
        return jsonify({"id": str(e.id)}), 201

@bp.post("/<uuid:event_id>/join")
@require_auth
def join_event(event_id):
    with SessionLocal() as s:
        e = s.get(Event, event_id)
        if not e:
            return jsonify({"error": "not_found"}), 404
        count = s.scalar(select(func.count()).select_from(EventParticipants)
                         .where(EventParticipants.c.event_id == event_id)) or 0
        if count >= e.capacity:
            return jsonify({"error": "full"}), 409
        try:
            s.execute(EventParticipants.insert().values(event_id=event_id, user_id=g.user_id))
            s.commit()
        except IntegrityError:
            s.rollback(); return jsonify({"error": "already_joined"}), 409
    return jsonify({"status": "joined"})

@bp.delete("/<uuid:event_id>/leave")
@require_auth
def leave_event(event_id):
    with SessionLocal() as s:
        s.execute(EventParticipants.delete().where(
            (EventParticipants.c.event_id==event_id) & (EventParticipants.c.user_id==g.user_id)
        ))
        s.commit()
    return jsonify({"status": "left"})
