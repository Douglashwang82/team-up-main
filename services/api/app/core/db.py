from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

# Create engine with pool_pre_ping to handle disconnections
# and connect_args to make connection more resilient
# app.logger.info(f"DATABASE_URL: {settings.DATABASE_URL}")
engine = create_engine(
    settings.DATABASE_URL,
    future=True,
    pool_pre_ping=True,  # Verify connections before using them
    connect_args={
        "connect_timeout": 10,  # 10 second timeout
    }
)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)

class Base(DeclarativeBase):
    pass

def ensure_postgis_extension():
    """Enable PostGIS extensions. May fail if already enabled or lacking permissions."""
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS btree_gist"))
        conn.commit()

def create_all_tables():
    """Create all database tables."""
    from app.models.user import User  # noqa
    from app.models.event import Event  # noqa
    from app.models.venue import Venue, Court, TimeSlot  # noqa
    from app.models.booking import Booking  # noqa
    Base.metadata.create_all(engine)
