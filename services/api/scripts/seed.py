from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from passlib.hash import bcrypt
from app.core.db import SessionLocal
from app.models.user import User
from app.models.event import Event

now = datetime.now(timezone.utc)
with SessionLocal() as s:
    u = s.query(User).filter_by(email="you@example.com").first()
    if not u:
        u = User(email="you@example.com", password_hash=bcrypt.hash("p@ssw0rd"), display_name="You")
        s.add(u); s.commit(); s.refresh(u)

    e1 = Event(title="Pickup 5v5", sport="basketball",
               starts_at=now + timedelta(hours=6), ends_at=now + timedelta(hours=8),
               capacity=10, address="Taipei Arena",
               host_id=u.id, location=func.ST_SetSRID(func.ST_MakePoint(121.565,25.033),4326))
    e2 = Event(title="Morning Run", sport="running",
               starts_at=now + timedelta(days=1, hours=7),
               ends_at=now + timedelta(days=1, hours=8),
               capacity=20, address="Daan Park",
               host_id=u.id, location=func.ST_SetSRID(func.ST_MakePoint(121.535,25.033),4326))
    s.add_all([e1, e2]); s.commit()
print("Seeded.")
