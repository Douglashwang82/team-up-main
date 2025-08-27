from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

engine = create_engine(settings.DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)

class Base(DeclarativeBase):
    pass

def ensure_postgis_extension():
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()

def create_all_tables():
    from app.models.user import User  # noqa
    from app.models.event import Event, EventParticipants  # noqa
    Base.metadata.create_all(engine)
