from flask import Blueprint, request, jsonify, g
from pydantic_core import ValidationError as PydanticValidationError

from app.core.db import SessionLocal
from app.core.auth import require_auth
from app.models import ChatMessage, ChatMemory, User
from app.schemas import ChatMessageIn, ChatMessageOut
from app.routes.user import SKILL_ORDER, _skill_distance
from app.core.llm import (
    generate_response,
    build_memory_profile,
    render_memory_profile,
)
from sqlalchemy import select
from sqlalchemy import desc
from sqlalchemy.dialects.postgresql import insert as pg_insert
from datetime import datetime, timezone

bp = Blueprint("chat", __name__)


def _get_matched_users_data(session, current_user_id) -> list[dict]:
    """Run matchmaking and return top 3 matched users as serializable dicts."""
    me = session.get(User, current_user_id)
    if not me or not me.preferred_sports:
        return []

    my_sports = set(me.preferred_sports)
    my_skills = me.skill_levels or {}

    candidates = session.execute(
        select(User).where(
            User.id != current_user_id,
            User.preferred_sports.isnot(None),
        )
    ).scalars().all()

    scored = []
    for user in candidates:
        their_sports = set(user.preferred_sports or [])
        their_skills = user.skill_levels or {}
        shared = my_sports & their_sports
        if not shared:
            continue

        score = 0
        skill_compat = {}
        for sport in shared:
            score += 3
            dist = _skill_distance(my_skills.get(sport), their_skills.get(sport))
            if dist == 0:
                score += 3
                skill_compat[sport] = "exact"
            elif dist == 1:
                score += 1
                skill_compat[sport] = "close"
            else:
                skill_compat[sport] = "different" if dist is not None else "unknown"

        scored.append({
            "user": {
                "id": str(user.id),
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
                "preferred_sports": user.preferred_sports,
                "skill_levels": user.skill_levels,
            },
            "match_score": score,
            "shared_sports": sorted(shared),
            "skill_compatibility": skill_compat,
        })

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored[:3]

@bp.route("/messages", methods=["GET"])
@require_auth
def list_messages():
    """
    Get all chat messages for the current user, ordered by creation time.
    Supports basic pagination via 'limit' and 'cursor' ID.
    Messages are returned in chronologically ascending order (oldest first in the slice),
    but the slice itself is taken from the latest messages before the cursor.
    """
    current_user_id = g.user_id
    limit = int(request.args.get("limit", 20))
    cursor_id = request.args.get("cursor")

    with SessionLocal() as session:
        query = session.query(ChatMessage).filter(
            ChatMessage.user_id == current_user_id
        )

        if cursor_id:
            import uuid
            try:
                valid_uuid = uuid.UUID(cursor_id)
                cursor_msg = session.query(ChatMessage).filter(ChatMessage.id == valid_uuid, ChatMessage.user_id == current_user_id).first()
                if cursor_msg:
                    query = query.filter(ChatMessage.created_at < cursor_msg.created_at)
            except ValueError:
                # Invalid UUID (e.g. from dummy "1" message), ignore cursor filter or return empty
                return jsonify([])

        messages = query.order_by(ChatMessage.created_at.desc()).limit(limit).all()
        messages.reverse()

        return jsonify([
            ChatMessageOut.model_validate(msg).model_dump(mode="json")
            for msg in messages
        ])

@bp.route("/messages", methods=["POST"])
@require_auth
def create_message():
    """
    Save a new chat message to the database.
    """
    current_user_id = g.user_id

    try:
        data = ChatMessageIn.model_validate(request.get_json())
    except PydanticValidationError as e:
        raise e

    with SessionLocal() as session:
        new_msg = ChatMessage(
            user_id=current_user_id,
            role=data.role,
            content=data.content,
            widget=data.widget
        )
        session.add(new_msg)
        session.commit()
        session.refresh(new_msg)

        if data.role == 'user':
            # 1. Fetch User info and chat history
            user = session.query(User).filter(User.id == current_user_id).first()
            user_name = user.display_name.split(' ')[0] if user and user.display_name else "friend"

            persisted = session.query(ChatMemory).filter(
                ChatMemory.user_id == current_user_id
            ).first()
            persisted_profile = persisted.memory_profile if persisted and isinstance(persisted.memory_profile, dict) else {}
            
            # Fetch a bounded window to build both short-term context and long-term memory.
            window_msgs = session.query(ChatMessage).filter(
                ChatMessage.user_id == current_user_id
            ).order_by(desc(ChatMessage.created_at)).limit(120).all()
            window_msgs.reverse()

            older_msgs = window_msgs[:-30] if len(window_msgs) > 30 else []
            recent_msgs = window_msgs[-30:]

            history = [{"role": m.role, "content": m.content} for m in recent_msgs]
            request_profile = build_memory_profile(
                [{"role": m.role, "content": m.content} for m in older_msgs],
                base_profile=persisted_profile,
            )
            request_memory = render_memory_profile(request_profile)
            
            # 2. Call Gemini
            llm_res = generate_response(history, user_name, memory=request_memory)

            # 2.5 If widget is MatchedUsers, inject real matchmaking data
            widget_payload = llm_res.get('widget')
            if widget_payload and widget_payload.get('type') == 'MatchedUsers':
                widget_payload['data'] = _get_matched_users_data(session, current_user_id)
            
            # 3. Save Assistant Message
            assistant_msg = ChatMessage(
                user_id=current_user_id,
                role='assistant',
                content=llm_res.get('content', ''),
                widget=widget_payload
            )
            session.add(assistant_msg)
            session.commit()
            session.refresh(assistant_msg)

            # 3.5 Update persisted memory with the latest user/assistant exchange.
            updated_profile = build_memory_profile([
                {"role": "user", "content": data.content},
                {"role": "assistant", "content": llm_res.get('content', '')},
            ], base_profile=request_profile)
            updated_memory = render_memory_profile(updated_profile)

            now = datetime.now(timezone.utc)
            upsert_stmt = pg_insert(ChatMemory).values(
                user_id=current_user_id,
                memory_text=updated_memory,
                memory_profile=updated_profile,
                created_at=now,
                updated_at=now,
            )
            session.execute(
                upsert_stmt.on_conflict_do_update(
                    index_elements=[ChatMemory.user_id],
                    set_={
                        "memory_text": updated_memory,
                        "memory_profile": updated_profile,
                        "updated_at": now,
                    },
                )
            )

            session.commit()
            
            # 4. Return the assistant message to the frontend seamlessly
            return jsonify(ChatMessageOut.model_validate(assistant_msg).model_dump(mode="json")), 201

        # Fallback if it was just an assistant message sync (won't happen normally now)
        return jsonify(ChatMessageOut.model_validate(new_msg).model_dump(mode="json")), 201

@bp.route("/messages", methods=["DELETE"])
@require_auth
def clear_messages():
    """
    Clear all chat messages for the current user.
    """
    current_user_id = g.user_id
    with SessionLocal() as session:
        session.query(ChatMessage).filter(
            ChatMessage.user_id == current_user_id
        ).delete()
        session.query(ChatMemory).filter(
            ChatMemory.user_id == current_user_id
        ).delete()
        session.commit()
        return jsonify({"ok": True, "message": "Chat history cleared"}), 200
