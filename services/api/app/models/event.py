import uuid, sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.types import Visibility, EventStatus
from app.core.db import Base

class Event(Base):
    __tablename__ = "events"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    title: Mapped[str] = mapped_column(sa.Text, nullable=False)
    description: Mapped[str | None]
    sport_type: Mapped[str | None]
    starts_at: Mapped[sa.DateTime | None] = mapped_column(sa.DateTime(timezone=True))
    ends_at: Mapped[sa.DateTime | None] = mapped_column(sa.DateTime(timezone=True))
    city: Mapped[str | None]
    capacity: Mapped[int | None]

    booking_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("bookings.id"))
    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"))
    visibility: Mapped[str] = mapped_column(sa.Text, default=Visibility.public.value, nullable=False)
    invite_token: Mapped[str | None]
    join_review_required: Mapped[bool] = mapped_column(sa.Boolean, default=True, nullable=False)

    status: Mapped[str] = mapped_column(sa.Text, default=EventStatus.open.value, nullable=False)
    created_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))
    updated_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))

    participants: Mapped[list["EventParticipant"]] = relationship(back_populates="event", cascade="all, delete-orphan")
