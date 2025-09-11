from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String, DateTime, Integer, ForeignKey, Enum, Text, Table, Column
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
import uuid
from geoalchemy2 import Geography
from app.core.db import Base

SPORTS = ("basketball","badminton","running","gym","tennis")

class Event(Base):
    __tablename__ = "events"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    host_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String, nullable=False)
    sport: Mapped[str] = mapped_column(Enum(*SPORTS, name="sport"), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at:   Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    capacity:  Mapped[int] = mapped_column(Integer, nullable=False)
    location:  Mapped[object] = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    address:   Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[str] = mapped_column(Enum("upcoming", "ongoing", "past", "cancelled", name="event_status"), default="upcoming", nullable=False)

EventParticipants = Table(
    "event_participants",
    Base.metadata,
    Column("event_id", UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id",  UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("joined_at", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
)
