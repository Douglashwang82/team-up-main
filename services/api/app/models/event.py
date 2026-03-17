import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base
from app.core.types import Visibility

class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    title: Mapped[str] = mapped_column(sa.Text, nullable=False)
    description: Mapped[str | None]
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False)
    image: Mapped[str | None] = mapped_column(sa.Text, nullable=True)

    # Location
    venue_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("venues.id"), nullable=True)
    court_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("courts.id"), nullable=True)

    # 組團相關設定
    max_participants: Mapped[int] = mapped_column(sa.Integer, default=10, nullable=False)

    # 可見性設定
    visibility: Mapped[str] = mapped_column(sa.Text, default=Visibility.public.value, nullable=False)
    invite_token: Mapped[str | None] = mapped_column(sa.Text, unique=True, nullable=True)

    # 時間戳
    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )

    # 關聯
    join_requests: Mapped[list["EventJoinRequest"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )

    participants: Mapped[list["EventParticipant"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )

    # 預約關聯
    bookings: Mapped[list["Booking"]] = relationship(
        back_populates="event"
    )

    # 狀態管理
    duration_type: Mapped[str] = mapped_column(sa.Text, default="temporary", nullable=False)  # temporary, permanent

    status: Mapped[str] = mapped_column(sa.Text, default="open", nullable=False)  # open, closed

    # ----------------------------------------------------------------------------------------------------------------------------

    # 限制條件和索引    
    __table_args__ = (
        sa.CheckConstraint("max_participants > 0", name="ck_event_max_gte_min"),
        sa.CheckConstraint("status IN ('open', 'closed')", name="ck_event_status"),
        sa.CheckConstraint("visibility IN ('public', 'private')", name="ck_event_visibility"),
        sa.Index("ix_events_owner_status", "owner_user_id", "status"),
        sa.Index("ix_events_visibility", "visibility"),
        sa.Index("ix_events_invite_token", "invite_token"),
    )

