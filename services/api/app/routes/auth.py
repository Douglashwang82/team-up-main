from flask import Blueprint, request, jsonify, current_app, g
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from passlib.hash import bcrypt
import jwt, datetime
from app.core.db import SessionLocal
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import SignupIn, LoginIn
from app.core.auth import require_auth

bp = Blueprint("auth", __name__)

def _issue_tokens(user_id: str):
    now = datetime.datetime.utcnow()
    access = jwt.encode({"sub": str(user_id), "exp": now + datetime.timedelta(seconds=settings.JWT_ACCESS_TTL)}, current_app.config["JWT_SECRET"], algorithm="HS256")
    refresh = jwt.encode({"sub": str(user_id), "exp": now + datetime.timedelta(seconds=settings.JWT_REFRESH_TTL)}, current_app.config["JWT_SECRET"], algorithm="HS256")
    return access, refresh

@bp.post("/signup")
def signup():
    data = SignupIn(**request.get_json())
    with SessionLocal() as s:
        u = User(email=data.email, password_hash=bcrypt.hash(data.password), display_name=data.display_name)
        s.add(u)
        try:
            s.commit(); s.refresh(u)
        except IntegrityError:
            s.rollback(); return jsonify({"error": "email_taken"}), 409
    a, r = _issue_tokens(u.id)
    return jsonify({"access_token": a, "refresh_token": r}), 201

@bp.post("/login")
def login():
    print("Login endpoint called", request.get_json())
    data = LoginIn(**request.get_json())
    print(data.email, data.password)
    with SessionLocal() as s:
        u = s.scalar(select(User).where(User.email == data.email))
        if not u or not bcrypt.verify(data.password, u.password_hash):
            return jsonify({"error": "invalid_credentials"}), 401
    a, r = _issue_tokens(u.id)
    return jsonify({"access_token": a, "refresh_token": r})

@bp.post("/refresh")
def refresh():
    token = (request.get_json() or {}).get("refresh_token")
    try:
        payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
    except Exception:
        return jsonify({"error": "invalid_token"}), 401
    a, r = _issue_tokens(payload["sub"])
    return jsonify({"access_token": a, "refresh_token": r})

@bp.get("/me")
@require_auth
def me():
    with SessionLocal() as s:
        u = s.get(User, g.user_id)
        if not u:
            return jsonify({"error": "not_found"}), 404
        return jsonify({"id": str(u.id), "email": u.email, "display_name": u.display_name})

@bp.patch("/me")
@require_auth
def update_me():
    """
    Updates the authenticated user's display name.

    Returns:
        JSON response with:
            - id (str): User ID
            - email (str): User email
            - display_name (str): User display name
        or error message if user not found.
    """
    data = request.get_json()
    if data is None:
        data = {}
    with SessionLocal() as s:
        u = s.get(User, g.user_id)
        if not u:
            return jsonify({"error": "not_found"}), 404
        u.display_name = data.get("display_name", u.display_name)
    try:
        s.commit()
    except Exception as e:
        s.rollback()
        return jsonify({"error": "update_failed", "details": str(e)}), 500
    print('successfully updated user profile:', {"id": str(u.id), "email": u.email, "display_name": u.display_name})
    return jsonify({"id": str(u.id), "email": u.email, "display_name": u.display_name})