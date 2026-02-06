import os
from flask import Flask, jsonify
from flask_cors import CORS
from pydantic_core import ValidationError as PydanticValidationError
from .core.config import settings
from .core.db import Base, engine, ensure_postgis_extension, create_all_tables

from .routes.health import bp as health_bp
from .routes.auth import bp as auth_bp
from .routes.venues import bp as venues_bp
from .routes.events import bp as events_bp
from .routes.bookings import bp as bookings_bp
from .routes.tickets import bp as tickets_bp
from .routes.notifications import bp as notifications_bp

def create_app() -> Flask:
    app = Flask(__name__)

    # Register health check FIRST before anything else
    app.register_blueprint(health_bp)

    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})
    app.config["JWT_SECRET"] = settings.JWT_SECRET

    # Database initialization - be lenient with errors on first startup
    # This happens AFTER health check is registered
    bootstrap_db = os.getenv("BOOTSTRAP_DB", "1")
    app.logger.info(f"BOOTSTRAP_DB setting: {bootstrap_db}")

    if bootstrap_db == "1":
        app.logger.info("Starting database bootstrap...")
        print('Starting database bootstrap...')
        try:
            # Try to enable PostGIS, but don't fail if it already exists or we lack permissions
            try:
                app.logger.info("Attempting to enable PostGIS extensions...")
                print('Attempting to enable PostGIS extensions...')
                ensure_postgis_extension()
                app.logger.info("PostGIS extensions enabled successfully")
                print('PostGIS extensions enabled successfully')
            except Exception as ext_err:
                app.logger.warning(f"PostGIS extension setup skipped: {ext_err}")
                print(f"PostGIS extension setup skipped: {ext_err}")

            # Create tables
            app.logger.info("Creating database tables...")
            print('Creating database tables...')
            create_all_tables()
            app.logger.info("Database tables initialized successfully")
            print('Database tables initialized successfully')
        except Exception as e:
            app.logger.error(f"DB bootstrap failed (app will continue): {e}")
            import traceback
            app.logger.error(traceback.format_exc())
            print(traceback.format_exc())
    else:
        app.logger.info("Database bootstrap disabled (BOOTSTRAP_DB=0)")
        print('Database bootstrap disabled (BOOTSTRAP_DB=0)')
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(venues_bp, url_prefix="/venues")
    app.register_blueprint(events_bp, url_prefix="/events")
    app.register_blueprint(bookings_bp, url_prefix="/bookings")
    app.register_blueprint(tickets_bp)
    app.register_blueprint(notifications_bp)

    @app.errorhandler(PydanticValidationError)
    def handle_validation_error(e):
        """Handle Pydantic validation errors"""
        errors = []
        for error in e.errors():
            errors.append({
                "field": ".".join(str(x) for x in error["loc"]),
                "message": error["msg"],
                "type": error["type"]
            })
        return jsonify({"error": "validation_error", "details": errors}), 422

    @app.errorhandler(Exception)
    def handle_err(e):
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 500

    return app
