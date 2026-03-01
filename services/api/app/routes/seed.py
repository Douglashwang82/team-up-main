from flask import Blueprint, jsonify

seed_bp = Blueprint("seed", __name__)

@seed_bp.route("/seed", methods=["GET", "POST"])
def run_seed():
    """Temporary endpoint to seed database. Remove after use."""
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
    from scripts.seed import main
    try:
        main()
        return jsonify({"status": "seeded"})
    except Exception as e:
        import traceback
        return jsonify({"status": "error", "message": str(e), "trace": traceback.format_exc()}), 500
