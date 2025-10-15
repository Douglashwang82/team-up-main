# app/routes/teamups.py
from flask import Blueprint, request, jsonify, g
from sqlalchemy import select, func, and_, desc
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from uuid import UUID

from app.core.db import SessionLocal
from app.core.auth import optional_auth, require_auth
from app.models.teamup import TeamUp
from app.models.teamup_join_request import TeamUpJoinRequest
from app.models.teamup_participant import TeamUpParticipant
from app.models.venue import Timeslot, Court, Venue
from app.models.user import User
from app.models.booking import Booking
from app.core.types import BookingStatus, PaymentStatus

bp = Blueprint("teamups", __name__)

def _parse_dt(s: str):
    """Parse datetime string, defaulting to UTC if no timezone info"""
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        from datetime import timezone
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

# ===[ 建立 TeamUp ]===
@bp.post("")
@require_auth
def create_teamup():
    """建立新的 TeamUp (no timeslot required)"""
    data = request.get_json() or {}

    required = ["title", "min_participants", "max_participants"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": "missing_fields", "fields": missing}), 400

    with SessionLocal() as s:
        # 建立 TeamUp (without required timeslot)
        teamup = TeamUp(
            title=data["title"],
            description=data.get("description"),
            owner_user_id=g.user_id,
            min_participants=data["min_participants"],
            max_participants=data["max_participants"],
            deadline=_parse_dt(data["deadline"]) if data.get("deadline") else None,
            sport_type=data.get("sport_type"),
            visibility=data.get("visibility", "public"),
        )

        s.add(teamup)
        s.flush()  # 取得 ID

        # 自動加入 owner 為參與者
        owner_participant = TeamUpParticipant(
            teamup_id=teamup.id,
            user_id=g.user_id,
            role="owner",
            display_name=g.user.get("display_name") if hasattr(g, 'user') else None,
        )
        s.add(owner_participant)

        s.commit()

        return jsonify({
            "id": str(teamup.id),
            "title": teamup.title,
            "status": teamup.status,
            "min_participants": teamup.min_participants,
            "max_participants": teamup.max_participants,
            "current_participants": 1,
            "visibility": teamup.visibility,
        }), 201

# ===[ Book timeslot for TeamUp ]===
@bp.post("/<uuid:teamup_id>/book")
@require_auth
def book_timeslot_for_teamup(teamup_id):
    """Book a timeslot for a TeamUp (can book multiple)"""
    data = request.get_json() or {}

    if "timeslot_id" not in data:
        return jsonify({"error": "timeslot_id_required"}), 400

    with SessionLocal() as s:
        # Verify TeamUp exists and user is owner
        teamup = s.get(TeamUp, teamup_id)
        if not teamup:
            return jsonify({"error": "teamup_not_found"}), 404

        if str(teamup.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Verify timeslot exists
        try:
            timeslot_id = UUID(str(data["timeslot_id"]))
        except ValueError:
            return jsonify({"error": "invalid_timeslot_id"}), 400

        timeslot = s.get(Timeslot, timeslot_id)
        if not timeslot:
            return jsonify({"error": "timeslot_not_found"}), 404

        if not timeslot.is_bookable:
            return jsonify({"error": "timeslot_not_bookable"}), 400

        # Check if timeslot is already booked
        existing_booking = s.execute(
            select(Booking).where(
                and_(
                    Booking.timeslot_id == timeslot_id,
                    Booking.status.in_(["pending", "confirmed"])
                )
            )
        ).scalar_one_or_none()

        if existing_booking:
            return jsonify({"error": "timeslot_already_booked"}), 400

        # Create booking for TeamUp
        booking = Booking(
            owner_user_id=g.user_id,
            timeslot_id=timeslot_id,
            teamup_id=teamup_id,
            status=BookingStatus.pending.value,
            payment_status=PaymentStatus.none.value,
        )

        s.add(booking)
        s.commit()
        s.refresh(booking)

        return jsonify({
            "id": str(booking.id),
            "teamup_id": str(booking.teamup_id),
            "timeslot_id": str(booking.timeslot_id),
            "status": booking.status,
            "payment_status": booking.payment_status,
            "created_at": booking.created_at.isoformat(),
        }), 201

# ===[ List TeamUp bookings ]===
@bp.get("/<uuid:teamup_id>/bookings")
@optional_auth
def list_teamup_bookings(teamup_id):
    """List all bookings for a TeamUp"""
    with SessionLocal() as s:
        teamup = s.get(TeamUp, teamup_id)
        if not teamup:
            return jsonify({"error": "teamup_not_found"}), 404

        # Get all bookings for this TeamUp
        bookings = s.execute(
            select(Booking, Timeslot, Court, Venue).join(
                Timeslot, Booking.timeslot_id == Timeslot.id
            ).join(
                Court, Timeslot.court_id == Court.id
            ).join(
                Venue, Court.venue_id == Venue.id
            ).where(
                Booking.teamup_id == teamup_id
            ).order_by(Timeslot.starts_at)
        ).all()

        booking_list = []
        for booking, timeslot, court, venue in bookings:
            booking_list.append({
                "id": str(booking.id),
                "status": booking.status,
                "payment_status": booking.payment_status,
                "timeslot": {
                    "id": str(timeslot.id),
                    "starts_at": timeslot.starts_at.isoformat(),
                    "ends_at": timeslot.ends_at.isoformat(),
                    "price_cents": timeslot.price_cents,
                    "currency": timeslot.currency,
                },
                "court": {
                    "id": str(court.id),
                    "name": court.name,
                    "sport_type": court.sport_type,
                },
                "venue": {
                    "id": str(venue.id),
                    "name": venue.name,
                    "address": venue.address,
                    "city": venue.city,
                },
                "created_at": booking.created_at.isoformat(),
            })

        return jsonify(booking_list)

# ===[ 列出 TeamUp ]===
@bp.get("")
@optional_auth
def list_teamups():
    """列出 TeamUp，支援篩選"""
    sport_type = request.args.get("sport_type")
    city = request.args.get("city")
    status = request.args.get("status", "open")
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = max(int(request.args.get("offset", 0)), 0)
    
    with SessionLocal() as s:
        query = select(TeamUp, CourtTimeslot, Court).join(
            CourtTimeslot, TeamUp.court_timeslot_id == CourtTimeslot.id
        ).join(Court, CourtTimeslot.court_id == Court.id)
        
        if sport_type:
            query = query.where(TeamUp.sport_type == sport_type)
        if status:
            query = query.where(TeamUp.status == status)
        if city:
            query = query.where(Court.venue.has(city=city))
        
        results = s.execute(
            query.order_by(TeamUp.created_at.desc()).offset(offset).limit(limit)
        ).all()
        
        teamup_list = []
        for teamup, court_timeslot, court in results:
            # 計算參與者數量
            participant_count = s.scalar(
                select(func.count()).select_from(TeamUpParticipant)
                .where(TeamUpParticipant.teamup_id == teamup.id)
            ) or 0
            
            teamup_list.append({
                "id": str(teamup.id),
                "title": teamup.title,
                "description": teamup.description,
                "sport_type": teamup.sport_type,
                "status": teamup.status,
                "min_participants": teamup.min_participants,
                "max_participants": teamup.max_participants,
                "current_participants": participant_count,
                "deadline": teamup.deadline.isoformat() if teamup.deadline else None,
                "court_name": court.name,
                "venue_name": court.venue.name,
                "starts_at": court_timeslot.starts_at.isoformat(),
                "ends_at": court_timeslot.ends_at.isoformat(),
                "created_at": teamup.created_at.isoformat(),
            })
        
        return jsonify(teamup_list)

# ===[ 取得單一 TeamUp ]===
@bp.get("/<uuid:teamup_id>")
@optional_auth
def get_teamup(teamup_id):
    """取得 TeamUp 詳情"""
    with SessionLocal() as s:
        teamup = s.get(TeamUp, teamup_id)
        if not teamup:
            return jsonify({"error": "not_found"}), 404
        
        # 取得相關資訊
        court_timeslot = s.get(CourtTimeslot, teamup.court_timeslot_id)
        court = s.get(Court, court_timeslot.court_id) if court_timeslot else None
        
        # 計算參與者數量
        participant_count = s.scalar(
            select(func.count()).select_from(TeamUpParticipant)
            .where(TeamUpParticipant.teamup_id == teamup.id)
        ) or 0
        
        # 取得參與者列表
        participants = s.execute(
            select(TeamUpParticipant, User).outerjoin(
                User, TeamUpParticipant.user_id == User.id
            ).where(TeamUpParticipant.teamup_id == teamup.id)
        ).all()
        
        participant_list = []
        for participant, user in participants:
            participant_list.append({
                "id": str(participant.id),
                "user_id": str(participant.user_id) if participant.user_id else None,
                "display_name": participant.display_name or (user.display_name if user else None),
                "email": participant.email or (user.email if user else None),
                "role": participant.role,
                "joined_at": participant.created_at.isoformat(),
            })
        
        return jsonify({
            "id": str(teamup.id),
            "title": teamup.title,
            "description": teamup.description,
            "sport_type": teamup.sport_type,
            "status": teamup.status,
            "min_participants": teamup.min_participants,
            "max_participants": teamup.max_participants,
            "current_participants": participant_count,
            "deadline": teamup.deadline.isoformat() if teamup.deadline else None,
            "owner_user_id": str(teamup.owner_user_id),
            "court_timeslot": {
                "id": str(court_timeslot.id),
                "court_name": court.name,
                "venue_name": court.venue.name,
                "starts_at": court_timeslot.starts_at.isoformat(),
                "ends_at": court_timeslot.ends_at.isoformat(),
                "price_cents": court_timeslot.price_cents,
                "currency": court_timeslot.currency,
            } if court_timeslot and court else None,
            "participants": participant_list,
            "created_at": teamup.created_at.isoformat(),
            "updated_at": teamup.updated_at.isoformat(),
        })

# ===[ 申請加入 TeamUp ]===
@bp.post("/<uuid:teamup_id>/join")
@optional_auth
def join_teamup(teamup_id):
    """申請加入 TeamUp"""
    data = request.get_json(silent=True) or {}
    
    with SessionLocal() as s:
        teamup = s.get(TeamUp, teamup_id)
        if not teamup:
            return jsonify({"error": "not_found"}), 404
        
        if teamup.status != "open":
            return jsonify({"error": "teamup_not_open"}), 400
        
        # 檢查是否已達上限
        current_count = s.scalar(
            select(func.count()).select_from(TeamUpParticipant)
            .where(TeamUpParticipant.teamup_id == teamup_id)
        ) or 0
        
        if current_count >= teamup.max_participants:
            return jsonify({"error": "teamup_full"}), 400
        
        # 檢查是否已申請或已參與
        if g.user_id:
            existing_request = s.execute(
                select(TeamUpJoinRequest).where(
                    and_(
                        TeamUpJoinRequest.teamup_id == teamup_id,
                        TeamUpJoinRequest.applicant_user_id == g.user_id,
                        TeamUpJoinRequest.status == "submitted"
                    )
                )
            ).scalar_one_or_none()
            
            if existing_request:
                return jsonify({"error": "already_applied"}), 400
            
            existing_participant = s.execute(
                select(TeamUpParticipant).where(
                    and_(
                        TeamUpParticipant.teamup_id == teamup_id,
                        TeamUpParticipant.user_id == g.user_id
                    )
                )
            ).scalar_one_or_none()
            
            if existing_participant:
                return jsonify({"error": "already_joined"}), 400
        
        # 建立申請
        if g.user_id:
            user = s.get(User, g.user_id)
            join_request = TeamUpJoinRequest(
                teamup_id=teamup_id,
                applicant_user_id=g.user_id,
                applicant_name=user.display_name or user.email,
                applicant_email=user.email,
                applicant_phone=user.phone,
                message=data.get("message"),
                status="submitted",
            )
        else:
            # 非會員申請
            required = ["applicant_name", "applicant_email"]
            missing = [k for k in required if k not in data]
            if missing:
                return jsonify({"error": "missing_fields", "fields": missing}), 400
            
            join_request = TeamUpJoinRequest(
                teamup_id=teamup_id,
                applicant_user_id=None,
                applicant_name=data["applicant_name"],
                applicant_email=data["applicant_email"],
                applicant_phone=data.get("applicant_phone"),
                message=data.get("message"),
                status="submitted",
            )
        
        s.add(join_request)
        s.commit()
        
        return jsonify({
            "id": str(join_request.id),
            "status": join_request.status,
            "message": "Join request submitted successfully"
        }), 201

# ===[ 列出加入申請 ]===
@bp.get("/<uuid:teamup_id>/join-requests")
@require_auth
def list_join_requests(teamup_id):
    """列出 TeamUp 的加入申請（僅 owner 可查看）"""
    with SessionLocal() as s:
        teamup = s.get(TeamUp, teamup_id)
        if not teamup:
            return jsonify({"error": "not_found"}), 404
        
        if str(teamup.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403
        
        requests = s.execute(
            select(TeamUpJoinRequest).where(
                TeamUpJoinRequest.teamup_id == teamup_id
            ).order_by(TeamUpJoinRequest.created_at.desc())
        ).scalars().all()
        
        return jsonify([{
            "id": str(req.id),
            "applicant_user_id": str(req.applicant_user_id) if req.applicant_user_id else None,
            "applicant_name": req.applicant_name,
            "applicant_email": req.applicant_email,
            "applicant_phone": req.applicant_phone,
            "message": req.message,
            "status": req.status,
            "created_at": req.created_at.isoformat(),
            "reviewed_at": req.reviewed_at.isoformat() if req.reviewed_at else None,
        } for req in requests])

# ===[ 審核加入申請 ]===
@bp.post("/<uuid:teamup_id>/join-requests/<uuid:request_id>/review")
@require_auth
def review_join_request(teamup_id, request_id):
    """審核加入申請（僅 owner 可操作）"""
    data = request.get_json(silent=True) or {}
    action = (data.get("action") or "").lower()
    
    if action not in ("approve", "reject"):
        return jsonify({"error": "invalid_action"}), 400
    
    with SessionLocal() as s:
        teamup = s.get(TeamUp, teamup_id)
        if not teamup:
            return jsonify({"error": "teamup_not_found"}), 404
        
        if str(teamup.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403
        
        join_request = s.get(TeamUpJoinRequest, request_id)
        if not join_request or join_request.teamup_id != teamup_id:
            return jsonify({"error": "request_not_found"}), 404
        
        if join_request.status != "submitted":
            return jsonify({"error": "already_reviewed"}), 400
        
        if action == "approve":
            # 檢查是否已達上限
            current_count = s.scalar(
                select(func.count()).select_from(TeamUpParticipant)
                .where(TeamUpParticipant.teamup_id == teamup_id)
            ) or 0
            
            if current_count >= teamup.max_participants:
                return jsonify({"error": "teamup_full"}), 400
            
            # 加入參與者
            try:
                participant = TeamUpParticipant(
                    teamup_id=teamup_id,
                    user_id=join_request.applicant_user_id,
                    role="member",
                    display_name=join_request.applicant_name,
                    email=join_request.applicant_email,
                    phone=join_request.applicant_phone,
                    join_request_id=request_id,
                )
                s.add(participant)
            except IntegrityError:
                s.rollback()
                return jsonify({"error": "already_joined"}), 409
            
            join_request.status = "approved"
            
            # 檢查是否達到最低人數要求
            new_count = current_count + 1
            if new_count >= teamup.min_participants:
                # 觸發成團邏輯
                _convert_teamup_to_event(s, teamup)
        else:
            join_request.status = "rejected"
        
        join_request.reviewed_at = datetime.utcnow()
        s.commit()
        
        return jsonify({
            "ok": True,
            "status": join_request.status,
            "message": f"Request {action}d successfully"
        })

def _convert_teamup_to_event(session, teamup: TeamUp):
    """將 TeamUp 轉換為 Event 的內部函數"""
    try:
        # 1. 建立 Booking
        court_timeslot = session.get(CourtTimeslot, teamup.court_timeslot_id)
        booking = Booking(
            user_id=teamup.owner_user_id,
            venue_id=session.get(Court, court_timeslot.court_id).venue_id,
            timeslot_id=teamup.court_timeslot_id,
            status=BookingStatus.confirmed.value,
            payment_status=PaymentStatus.none.value,
        )
        session.add(booking)
        session.flush()
        
        # 2. 建立 Event
        event = Event(
            title=teamup.title,
            description=teamup.description,
            sport_type=teamup.sport_type,
            starts_at=court_timeslot.starts_at,
            ends_at=court_timeslot.ends_at,
            capacity=teamup.max_participants,
            booking_id=booking.id,
            owner_user_id=teamup.owner_user_id,
            visibility="public",
            join_review_required=False,  # 已經審核過了
            status="open",
        )
        session.add(event)
        session.flush()
        
        # 3. 轉移參與者
        participants = session.execute(
            select(TeamUpParticipant).where(TeamUpParticipant.teamup_id == teamup.id)
        ).scalars().all()
        
        for participant in participants:
            event_participant = EventParticipant(
                event_id=event.id,
                user_id=participant.user_id,
                role="member" if participant.role == "member" else "owner",
                display_name=participant.display_name,
                email=participant.email,
                phone=participant.phone,
            )
            session.add(event_participant)
        
        # 4. 更新 TeamUp 狀態
        teamup.status = "confirmed"
        
        # 5. 關閉其他競爭的 TeamUp
        session.execute(
            select(TeamUp).where(
                and_(
                    TeamUp.court_timeslot_id == teamup.court_timeslot_id,
                    TeamUp.id != teamup.id,
                    TeamUp.status == "open"
                )
            )
        ).scalars().all()
        
        for other_teamup in session.execute(
            select(TeamUp).where(
                and_(
                    TeamUp.court_timeslot_id == teamup.court_timeslot_id,
                    TeamUp.id != teamup.id,
                    TeamUp.status == "open"
                )
            )
        ).scalars().all():
            other_teamup.status = "closed"
        
        return event
        
    except Exception as e:
        session.rollback()
        raise e
