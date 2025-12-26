import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from app.core.db import Base
from datetime import date, time

class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False)

    # Preferences
    date: Mapped[date] = mapped_column(sa.Date, nullable=False)
    start_time: Mapped[time] = mapped_column(sa.Time, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    sport_type: Mapped[str] = mapped_column(sa.Text, nullable=False)
    intensity: Mapped[str] = mapped_column(sa.Text, nullable=False) # Low, Medium, High
    
    # Venue preferences (required - at least one venue)
    venue_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(UUID(as_uuid=True)), nullable=False)

    # Price range
    price_min: Mapped[int | None] = mapped_column(sa.Integer, nullable=True)
    price_max: Mapped[int | None] = mapped_column(sa.Integer, nullable=True)
    currency: Mapped[str] = mapped_column(sa.Text, default="USD", nullable=False)

    # Status
    status: Mapped[str] = mapped_column(sa.Text, default="open", nullable=False) # open, matched, expired

    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", backref="tickets")
