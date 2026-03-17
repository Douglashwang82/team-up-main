from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
import uuid
from app.core.db import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    display_name: Mapped[str] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    phone: Mapped[str | None] = mapped_column(String, nullable=True)

    # Profile Preferences
    preferred_sports: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    skill_levels: Mapped[dict[str, str] | None] = mapped_column(JSONB, nullable=True)
    preferred_time_slots: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    preferred_language: Mapped[str | None] = mapped_column(String, nullable=True)
    custom_preferences: Mapped[str | None] = mapped_column(String, nullable=True)
