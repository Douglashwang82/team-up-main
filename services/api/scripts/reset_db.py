import sys
from pathlib import Path
import os
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.db import Base, engine
import app.models.user
import app.models.venue
import app.models.event
import app.models.booking
import app.models.ticket
import app.models.event_participant
import app.models.event_join_request
import app.models.notification
import geoalchemy2

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("All tables dropped.")
