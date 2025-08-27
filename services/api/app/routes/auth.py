from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from passlib.hash import bcrypt
import jwt, datetime
from app.core.db import SessionLocal
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import SignupIn, LoginIn

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
    data = LoginIn(**request.get_json())
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
