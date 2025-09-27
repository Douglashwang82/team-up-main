from flask import Blueprint, request, jsonify, g
from app.models.venue import Venue, VenueTimeslot
from sqlalchemy import select, func, and_, desc, delete
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from app.core.db import SessionLocal
from app.models.event import Event
from app.models.participant import EventParticipant
from app.models.user import User
from app.core.auth import require_auth
from app.utils import is_nonzero_number

# ==== Sprint 4 新增的 imports ====
from uuid import UUID
from app.models.booking import Booking
from app.models.join_request import EventJoinRequest
from app.core.security import gen_invite_token  # 你前面建立的 base62 亂數工具
# ==================================

bp = Blueprint("events", __name__)

def _parse_dt(s: str):
    # Always parse as UTC if no timezone info
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        from datetime import timezone
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

# ===[ 既有：地圖搜尋列活動（保留） ]===
@bp.get("")
def get_events():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    radius_km = request.args.get("radius")
    sport_type = request.args.get("sport_type")
    start_at = request.args.get("start_at")
    end_at = request.args.get("end_at")
    limit = min(int(request.args.get("limit", 50)), 200)
    offset = max(int(request.args.get("offset", 0)), 0)

    with SessionLocal() as s:
        q = select(Event)

        # 僅展示可公開搜尋的活動（Sprint 4：visibility=public）
        q = q.where(Event.visibility == "public")

        # If lat/lng/radius provided, filter by location
        if is_nonzero_number(lat) and is_nonzero_number(lng) and is_nonzero_number(radius_km):
            point = func.ST_SetSRID(func.ST_MakePoint(float(lng), float(lat)), 4326)
            q = q.where(func.ST_DWithin(Event.location, point, float(radius_km) * 1000))
        if sport_type:
            q = q.where(Event.sport_type == sport_type)
        if start_at:
            q = q.where(Event.starts_at >= _parse_dt(start_at))
        if end_at:
            q = q.where(Event.ends_at <= _parse_dt(end_at))

        rows = s.execute(q.order_by(Event.starts_at.asc()).offset(offset).limit(limit)).scalars().all()
        ids = [e.id for e in rows]
        counts = {}
        if ids:
            cnt_rows = s.execute(
                select(EventParticipant.event_id, func.count())
                .where(EventParticipant.event_id.in_(ids))
                .group_by(EventParticipant.event_id)
            ).all()
            counts = {r[0]: r[1] for r in cnt_rows}

        def event_to_dict_with_location (e: Event):
            venue_location = None
            if e.booking_id:
                booking = s.get(Booking, e.booking_id)
                if booking:
                    venue = s.get(Venue, booking.venue_id)
                    if venue and venue.geo_point:
                        venue_location = venue.geo_point  # 假設 geo_point 是 "POINT(lng lat)" 格式的字串
            return {
                "id": str(e.id),
                "title": e.title,
                "sport_type": e.sport_type,
                "starts_at": e.starts_at.isoformat(),
                "ends_at": e.ends_at.isoformat(),
                "capacity": e.capacity,
                "attending": counts.get(e.id, 0),
                "booking_id": e.booking_id,
                "venue_location": venue_location,
                "status": e.status,
                "visibility": getattr(e, "visibility", "public"),
            }
        return jsonify([event_to_dict_with_location(e) for e in rows])

# ===[ 既有：單一活動（保留） ]===
@bp.get("/<uuid:event_id>")
def get_event(event_id):
    with SessionLocal() as s:
        e = s.get(Event, event_id)
        if not e:
            return jsonify({"error": "not_found"}), 404

        # private event 僅 owner 可見（invite_only 需使用 token 端點）
        if getattr(e, "visibility", "public") == "private":
            # 允許 owner 看；其他人 404
            current_user_id = getattr(g, "user_id", None)
            owner_id = getattr(e, "owner_user_id", None) or getattr(e, "host_id", None)
            if not current_user_id or str(owner_id) != str(current_user_id):
                return jsonify({"error": "not_found"}), 404

        attending = s.scalar(
            select(func.count()).select_from(EventParticipant)
            .where(EventParticipant.event_id == event_id)
        ) or 0
        venue_location = None
        if e.booking_id:
            booking = s.get(Booking, e.booking_id)
            if booking:
                venue = s.get(Venue, booking.venue_id)
                if venue and venue.geo_point:
                    venue_location = venue.geo_point  # 假設 geo_point 是 "POINT(lng lat)" 格式的字串

        return jsonify({
            "id": str(e.id),
            "title": e.title,
            "sport_type": e.sport_type,
            "starts_at": e.starts_at.isoformat(),
            "ends_at": e.ends_at.isoformat(),
            "capacity": e.capacity,
            "attending": attending,
            "host_id": str(getattr(e, "owner_user_id", None) or getattr(e, "host_id", "") or "") or None,
            "venue_location": venue_location,
            "status": e.status,
            "visibility": getattr(e, "visibility", "public"),
            "invite_token": getattr(e, "invite_token", None),
            "booking_id": str(getattr(e, "booking_id", "")) if getattr(e, "booking_id", None) else None,
        })

# ===[ 變更：建立活動（Sprint 4） ]===
# 支援由 booking 建立活動 + visibility + invite_token
@bp.post("")
@require_auth
def create_event():
    data = request.get_json() or {}

    # Sprint 4：支援兩種建立方式
    # A) 由 booking 建立（推薦）：required = booking_id, title, visibility
    # B) 舊有地圖直接建立（相容舊前端）：required = title,sport_type,starts_at,ends_at,capacity,lat,lng
    is_booking_flow = "booking_id" in data

    if is_booking_flow:
        required = ["booking_id", "title", "visibility"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": "missing_fields", "fields": missing}), 400

        with SessionLocal() as s:
            # 1) 取 booking
            try:
                bk_id = UUID(str(data["booking_id"]))
            except ValueError:
                return jsonify({"error": "invalid_booking_id"}), 400
            bk_with_ts = s.execute(
                select(Booking, VenueTimeslot)
                .join(VenueTimeslot, Booking.timeslot_id == VenueTimeslot.id)
                .where(Booking.id == bk_id)).first()
            if not bk_with_ts:
                return jsonify({"error": "booking_not_found"}), 404
            bk, ts = bk_with_ts
            visibility = data["visibility"]
            if visibility not in ("public", "invite_only", "private"):
                return jsonify({"error": "invalid_visibility"}), 400

            invite_token = gen_invite_token() if visibility == "invite_only" else None
            
            q = select(Event).where(Event.booking_id == bk.id)
            existing = s.execute(q).scalar_one_or_none()
            if existing:
                return jsonify({"error": "event_already_exists_for_booking"}), 400

            e = Event(
                title=data["title"],
                description=data.get("description"),
                sport_type=data.get("sport_type"),
                booking_id=bk.id,
                owner_user_id=g.user_id,  # Sprint 4 owner 欄位
                visibility=visibility,
                invite_token=invite_token,
                join_review_required=True,  # 依需求：皆需審核
                status="open",
                # 可選：若要把 timeslot 時間複製到 event
                starts_at=getattr(ts, "starts_at", None),
                ends_at=getattr(ts, "ends_at", None) or data.get("ends_at") and _parse_dt(data["ends_at"]),
            )
            s.add(e)
            s.commit(); s.refresh(e)
            return jsonify({"id": str(e.id), "invite_token": invite_token}), 201

    # ---- 舊有流程：直接用座標建立（相容） ----
    required = ["title","sport_type","starts_at","ends_at","capacity","lat","lng"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": "missing_fields", "fields": missing}), 400

    with SessionLocal() as s:
        e = Event(
            title=data["title"], sport_type=data["sport_type"],
            starts_at=_parse_dt(data["starts_at"]), ends_at=_parse_dt(data["ends_at"]),
            capacity=int(data["capacity"]),
            # Sprint 4：owner 欄位名稱可能是 owner_user_id；相容舊的 host_id
            owner_user_id=getattr(g, "user_id", None),
            host_id=getattr(g, "user_id", None),  # 若你的模型仍有 host_id，也一併回填
            visibility=data.get("visibility", "public"),
            invite_token=gen_invite_token() if data.get("visibility") == "invite_only" else None,
            join_review_required=True,
            location=func.ST_SetSRID(func.ST_MakePoint(float(data["lng"]), float(data["lat"])), 4326),
            status="open",
        )
        s.add(e)
        s.commit(); s.refresh(e)
        return jsonify({"id": str(e.id), "invite_token": e.invite_token}), 201

# ===[ 新增：公開活動清單（僅 public） ]===
@bp.get("/public")
def get_public_events():
    limit = min(int(request.args.get("limit", 50)), 200)
    offset = max(int(request.args.get("offset", 0)), 0)
    with SessionLocal() as s:
        rows = s.execute(
            select(Event)
            .where(Event.visibility == "public")
            .order_by(desc(Event.created_at))
            .offset(offset).limit(limit)
        ).scalars().all()

        ids = [e.id for e in rows]
        counts = {}
        if ids:
            cnt_rows = s.execute(
                select(EventParticipant.event_id, func.count())
                .where(EventParticipant.event_id.in_(ids))
                .group_by(EventParticipant.event_id)
            ).all()
            counts = {r[0]: r[1] for r in cnt_rows}


        return jsonify([{
            "id": str(e.id),
            "title": e.title,
            "sport_type": e.sport_type,
            "starts_at": e.starts_at.isoformat() if e.starts_at else None,
            "ends_at": e.ends_at.isoformat() if e.ends_at else None,
            "capacity": e.capacity,
            "attending": counts.get(e.id, 0),
            "city": getattr(e, "city", None),
            "status": e.status,
            "visibility": e.visibility,
        } for e in rows])

# ===[ 新增：invite-only 憑 token 讀取 ]===
@bp.get("/token/<invite_token>")
def get_invite_only(invite_token: str):
    with SessionLocal() as s:
        e = s.execute(
            select(Event).where(and_(Event.invite_token == invite_token, Event.visibility == "invite_only"))
        ).scalar_one_or_none()
        if not e:
            return jsonify({"error": "not_found"}), 404
        attending = s.scalar(
            select(func.count()).select_from(EventParticipant)
            .where(EventParticipant.event_id == e.id)
        ) or 0
        return jsonify({
            "id": str(e.id),
            "title": e.title,
            "sport_type": e.sport_type,
            "starts_at": e.starts_at.isoformat() if e.starts_at else None,
            "ends_at": e.ends_at.isoformat() if e.ends_at else None,
            "capacity": e.capacity,
            "attending": attending,
            "status": e.status,
            "visibility": e.visibility,
            "invite_token": e.invite_token,
        })

# ===[ 變更：加入活動（改為送出申請，支援非會員） ]===
@bp.post("/<uuid:event_id>/join")
def join_event(event_id):
    """
    Sprint 4 規則：參與者（含非會員）先送出申請，owner 審核通過才成為參與者。
    若前端仍呼叫此舊路徑，我們轉為建立 join_request。
    """
    data = request.get_json(silent=True) or {}
    applicant_name = data.get("applicant_name")
    applicant_email = data.get("applicant_email")
    applicant_phone = data.get("applicant_phone")
    message = data.get("message")

    if not applicant_name:
        # 若有登入，可用使用者名稱；否則要求填
        applicant_name = getattr(g, "user_display_name", None)
    if not applicant_name:
        return jsonify({"error": "applicant_name_required"}), 400

    with SessionLocal() as s:
        e = s.get(Event, event_id)
        if not e:
            return jsonify({"error": "not_found"}), 404

        if e.visibility == "private":
            return jsonify({"error": "private_event"}), 403

        # 建立 join request（允許匿名 → applicant_user_id 可為 None）
        jr = EventJoinRequest(
            event_id=e.id,
            applicant_user_id=getattr(g, "user_id", None),
            applicant_name=applicant_name,
            applicant_email=applicant_email,
            applicant_phone=applicant_phone,
            message=message,
            status="submitted",
        )
        s.add(jr)
        s.commit(); s.refresh(jr)

        return jsonify({
            "id": str(jr.id),
            "status": jr.status
        }), 201

# ===[ 既有：退出活動（保留） ]===
@bp.delete("/<uuid:event_id>/leave")
@require_auth
def leave_event(event_id):
    with SessionLocal() as s:
        s.execute(
            delete(EventParticipant).where(
                (EventParticipant.event_id == event_id) &
                (EventParticipant.user_id == g.user_id)
            )
        )
        s.commit()
    return jsonify({"status": "left"})

# ===[ 既有：參與者列表（保留） ]===
@bp.get("/<uuid:event_id>/participants")
def event_participants(event_id):
    with SessionLocal() as s:
        rows = s.execute(
            select(EventParticipant.user_id, EventParticipant.display_name, EventParticipant.email)
            .where(EventParticipant.event_id == event_id)
            .order_by(EventParticipant.created_at.asc())
        ).all()
    return jsonify([
        {
            "user_id": str(r[0]) if r[0] else None,
            "display_name": r[1],
            "email": r[2],
        } for r in rows
    ])

# ===[ 既有：全列表（保留，並帶上 visibility） ]===
@bp.get("/all")
@require_auth
def get_all_events():
    """
    Fetch all events (no location filter).
    Query params:
      - sport_type: optional, e.g. basketball
      - start, end: ISO8601 strings (inclusive start, inclusive end)
      - limit: default 50, max 500
      - offset: default 0
      - order: 'asc' (default) or 'desc' by starts_at
    """
    sport_type = request.args.get("sport_type")
    start = request.args.get("start")
    end   = request.args.get("end")
    limit = min(int(request.args.get("limit", 50)), 500)
    offset = max(int(request.args.get("offset", 0)), 0)
    order = (request.args.get("order") or "asc").lower()
    order_by = Event.starts_at.asc() if order != "desc" else Event.starts_at.desc()

    with SessionLocal() as s:
        q = select(Event)
        if sport_type:
            q = q.where(Event.sport_type == sport_type)
        if start:
            q = q.where(Event.starts_at >= _parse_dt(start))
        if end:
            q = q.where(Event.ends_at <= _parse_dt(end))

        rows = s.execute(
            q.order_by(order_by).offset(offset).limit(limit)
        ).scalars().all()

        # one query to get attending counts for these ids
        ids = [e.id for e in rows]
        counts = {}
        if ids:
            cnt_rows = s.execute(
                select(EventParticipant.event_id, func.count())
                .where(EventParticipant.event_id.in_(ids))
                .group_by(EventParticipant.event_id)
            ).all()
            counts = {r[0]: r[1] for r in cnt_rows}

        def event_to_dict_with_location(e: Event):
            venue_location = None
            if e.booking_id:
                booking = s.get(Booking, e.booking_id)
                if booking:
                    venue = s.get(Venue, booking.venue_id)
                    if venue and venue.geo_point:
                        venue_location = venue.geo_point  # 假設 geo_point 是 "POINT(lng lat)" 格式的字串
            return {
                "id": str(e.id),
                "title": e.title,
                "sport_type": e.sport_type,
                "starts_at": e.starts_at.isoformat(),
                "ends_at": e.ends_at.isoformat(),
                "capacity": e.capacity,
                "attending": counts.get(e.id, 0),
                "booking_id": e.booking_id,
                "venue_location": venue_location,   
                "status": e.status,
                "visibility": getattr(e, "visibility", "public"),
            }

        return jsonify([event_to_dict_with_location(e) for e in rows])

# ===[ 新增：Owner 審核列表 ]===
@bp.get("/owner/<uuid:event_id>/join-requests")
@require_auth
def owner_list_requests(event_id):
    with SessionLocal() as s:
        e = s.get(Event, event_id)
        if not e:
            return jsonify({"error": "not_found"}), 404

        owner_id = getattr(e, "owner_user_id", None) or getattr(e, "host_id", None)
        if not owner_id or str(owner_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        reqs = s.execute(
            select(EventJoinRequest)
            .where(EventJoinRequest.event_id == event_id)
            .order_by(desc(EventJoinRequest.created_at))
        ).scalars().all()

        return jsonify([{
            "id": str(r.id),
            "applicant_name": r.applicant_name,
            "applicant_email": r.applicant_email,
            "applicant_phone": r.applicant_phone,
            "status": r.status,
            "created_at": r.created_at.isoformat() if getattr(r, "created_at", None) else None,
        } for r in reqs])

# ===[ 新增：Owner 審核 approve/reject ]===
@bp.post("/owner/join-requests/<uuid:req_id>")
@require_auth
def owner_review_request(req_id):
    data = request.get_json(silent=True) or {}
    action = (data.get("action") or "").lower()
    if action not in ("approve", "reject"):
        return jsonify({"error": "invalid_action"}), 400

    with SessionLocal() as s:
        jr = s.get(EventJoinRequest, req_id)
        if not jr:
            return jsonify({"error": "not_found"}), 404

        e = s.get(Event, jr.event_id)
        if not e:
            return jsonify({"error": "event_not_found"}), 404

        owner_id = getattr(e, "owner_user_id", None) or getattr(e, "host_id", None)
        if not owner_id or str(owner_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        if action == "approve":
            # 核准 → 寫入 participants（非會員帶入申請資料）
            try:
                p = EventParticipant(
                    event_id=e.id,
                    user_id=jr.applicant_user_id,              # 允許 None（非會員）
                    role="member",
                    display_name=jr.applicant_name,
                    email=jr.applicant_email,
                    phone=jr.applicant_phone,
                    join_request_id=jr.id,
                )
                s.add(p)
            except IntegrityError:
                s.rollback()
                return jsonify({"error": "already_joined"}), 409
            jr.status = "approved"
        else:
            jr.status = "rejected"

        s.commit()
        return jsonify({"ok": True, "status": jr.status})
