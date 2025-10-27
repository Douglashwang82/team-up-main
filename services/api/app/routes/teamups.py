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
from app.models.venue import TimeSlot, Court, Venue
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
    """建立新的 TeamUp"""
    data = request.get_json() or {}

    required = ["title", "max_participants"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": "missing_fields", "fields": missing}), 400

    with SessionLocal() as s:
        teamup = TeamUp(
            title=data["title"],
            description=data.get("description"),
            owner_user_id=g.user_id,
            max_participants=data["max_participants"],
            visibility=data.get("visibility", "public"),
            durantion_type=data.get("durantion_type", "temporary"),
            status=data.get("status", "open"),
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
            "max_participants": teamup.max_participants,
            "current_participants": 1,
            "visibility": teamup.visibility,
            "durantion_type": teamup.durantion_type,
        }), 201

# ===[ Book time slot for TeamUp ]===
@bp.post("/<uuid:teamup_id>/book")
@require_auth
def book_time_slot_for_teamup(teamup_id):
    """Book a time slot for a TeamUp (can book multiple)"""
    data = request.get_json() or {}

    if "time_slot_id" not in data:
        return jsonify({"error": "time_slot_id_required"}), 400

    with SessionLocal() as s:
        # Verify TeamUp exists and user is owner
        teamup = s.get(TeamUp, teamup_id)
        if not teamup:
            return jsonify({"error": "teamup_not_found"}), 404

        if str(teamup.owner_user_id) != str(g.user_id):
            return jsonify({"error": "not_owner"}), 403

        # Verify time slot exists
        try:
            time_slot_id = UUID(str(data["time_slot_id"]))
        except ValueError:
            return jsonify({"error": "invalid_time_slot_id"}), 400

        time_slot = s.get(TimeSlot, time_slot_id)
        if not time_slot:
            return jsonify({"error": "time_slot_not_found"}), 404

        if not time_slot.is_bookable:
            return jsonify({"error": "time_slot_not_bookable"}), 400

        # Check if time slot is already booked
        existing_booking = s.execute(
            select(Booking).where(
                and_(
                    Booking.time_slot_id == time_slot_id,
                    Booking.status.in_(["pending", "confirmed"])
                )
            )
        ).scalar_one_or_none()

        if existing_booking:
            return jsonify({"error": "time_slot_already_booked"}), 400

        # Create booking for TeamUp
        booking = Booking(
            owner_user_id=g.user_id,
            time_slot_id=time_slot_id,
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
            "time_slot_id": str(booking.time_slot_id),
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
            select(Booking, TimeSlot, Court, Venue).join(
                TimeSlot, Booking.time_slot_id == TimeSlot.id
            ).join(
                Court, TimeSlot.court_id == Court.id
            ).join(
                Venue, Court.venue_id == Venue.id
            ).where(
                Booking.teamup_id == teamup_id
            ).order_by(TimeSlot.starts_at)
        ).all()

        booking_list = []
        for booking, time_slot, court, venue in bookings:
            booking_list.append({
                "id": str(booking.id),
                "status": booking.status,
                "payment_status": booking.payment_status,
                "time_slot": {
                    "id": str(time_slot.id),
                    "starts_at": time_slot.starts_at.isoformat(),
                    "ends_at": time_slot.ends_at.isoformat(),
                    "price_cents": time_slot.price_cents,
                    "currency": time_slot.currency,
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
    status = request.args.get("status", "open")
    visibility = request.args.get("visibility")
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = max(int(request.args.get("offset", 0)), 0)

    with SessionLocal() as s:
        query = select(TeamUp)

        if status:
            query = query.where(TeamUp.status == status)
        if visibility:
            query = query.where(TeamUp.visibility == visibility)

        results = s.execute(
            query.order_by(desc(TeamUp.created_at)).offset(offset).limit(limit)
        ).scalars().all()

        teamup_list = []
        for teamup in results:
            # 計算參與者數量
            participant_count = s.scalar(
                select(func.count()).select_from(TeamUpParticipant)
                .where(TeamUpParticipant.teamup_id == teamup.id)
            ) or 0

            teamup_list.append({
                "id": str(teamup.id),
                "title": teamup.title,
                "description": teamup.description,
                "status": teamup.status,
                "max_participants": teamup.max_participants,
                "current_participants": participant_count,
                "visibility": teamup.visibility,
                "durantion_type": teamup.durantion_type,
                "created_at": teamup.created_at.isoformat(),
            })

        return jsonify(teamup_list)

# ===[ 列出 TeamUp 基於 Title ]===
@bp.get("/search")
@optional_auth
def search_teamups():
    keyword = request.args.get("keyword", "").strip()
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = max(int(request.args.get("offset", 0)), 0)

    if not keyword:
        return jsonify({"error": "title_keyword_required"}), 400

    with SessionLocal() as s:
        query = select(TeamUp).where(TeamUp.title.ilike(f"%{keyword}%"))

        results = s.execute(
            query.order_by(desc(TeamUp.created_at)).offset(offset).limit(limit)
        ).scalars().all()

        teamup_list = []
        for teamup in results:
            # 計算參與者數量
            participant_count = s.scalar(
                select(func.count()).select_from(TeamUpParticipant)
                .where(TeamUpParticipant.teamup_id == teamup.id)
            ) or 0

            teamup_list.append({
                "id": str(teamup.id),
                "title": teamup.title,
                "description": teamup.description,
                "status": teamup.status,
                "max_participants": teamup.max_participants,
                "current_participants": participant_count,
                "visibility": teamup.visibility,
                "durantion_type": teamup.durantion_type,
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

        # 取得關聯的 bookings
        bookings = s.execute(
            select(Booking, TimeSlot, Court, Venue).join(
                TimeSlot, Booking.time_slot_id == TimeSlot.id
            ).join(
                Court, TimeSlot.court_id == Court.id
            ).join(
                Venue, Court.venue_id == Venue.id
            ).where(
                Booking.teamup_id == teamup_id
            ).order_by(TimeSlot.starts_at)
        ).all()

        booking_list = []
        for booking, time_slot, court, venue in bookings:
            booking_list.append({
                "id": str(booking.id),
                "status": booking.status,
                "payment_status": booking.payment_status,
                "time_slot": {
                    "id": str(time_slot.id),
                    "starts_at": time_slot.starts_at.isoformat(),
                    "ends_at": time_slot.ends_at.isoformat(),
                    "price_cents": time_slot.price_cents,
                    "currency": time_slot.currency,
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
            })

        return jsonify({
            "id": str(teamup.id),
            "title": teamup.title,
            "description": teamup.description,
            "status": teamup.status,
            "max_participants": teamup.max_participants,
            "current_participants": participant_count,
            "owner_user_id": str(teamup.owner_user_id),
            "visibility": teamup.visibility,
            "durantion_type": teamup.durantion_type,
            "participants": participant_list,
            "bookings": booking_list,
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
        else:
            join_request.status = "rejected"
        
        join_request.reviewed_at = datetime.utcnow()
        s.commit()
        
        return jsonify({
            "ok": True,
            "status": join_request.status,
            "message": f"Request {action}d successfully"
        })
