import os
from flask import Flask, jsonify
from flask_cors import CORS
from .core.config import settings
from .core.db import Base, engine, ensure_postgis_extension, create_all_tables

from .routes.health import bp as health_bp
from .routes.auth import bp as auth_bp
from .routes.events import bp as events_bp

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    app.config["JWT_SECRET"] = settings.JWT_SECRET

    # Optional bootstrap: ensure postgis + tables exist (MVP convenience)
    if os.getenv("BOOTSTRAP_DB", "1") == "1":
        try:
            ensure_postgis_extension()
            create_all_tables()
        except Exception as e:
            app.logger.warning(f"DB bootstrap skipped/failed: {e}")

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(events_bp, url_prefix="/events")

    @app.errorhandler(Exception)
    def handle_err(e):
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 500

    return app
