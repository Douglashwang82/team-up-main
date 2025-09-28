from flask import request, jsonify, current_app, g
from functools import wraps
import jwt

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "unauthorized"}), 401
        token = auth.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
        except Exception:
            return jsonify({"error": "invalid_token"}), 401
        g.user_id = payload.get("sub")
        if not g.user_id:
            return jsonify({"error": "invalid_token"}), 401
        return fn(*args, **kwargs)
    return wrapper

def optional_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
            try:
                payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
                g.user_id = payload.get("sub")
            except Exception:
                g.user_id = None
        else:
            g.user_id = None
        return fn(*args, **kwargs)
    return wrapper