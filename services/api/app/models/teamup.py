import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base
from app.core.types import Visibility

class TeamUp(Base):
    __tablename__ = "teamups"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    title: Mapped[str] = mapped_column(sa.Text, nullable=False)
    description: Mapped[str | None]
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False)
    
    # 組團相關設定
    min_participants: Mapped[int] = mapped_column(sa.Integer, default=2, nullable=False)
    max_participants: Mapped[int] = mapped_column(sa.Integer, default=10, nullable=False)
    deadline: Mapped[sa.DateTime | None] = mapped_column(sa.DateTime(timezone=True))
    sport_type: Mapped[str | None] = mapped_column(sa.Text)

    # 可見性設定
    visibility: Mapped[str] = mapped_column(sa.Text, default=Visibility.public.value, nullable=False)
    invite_token: Mapped[str | None] = mapped_column(sa.Text, unique=True, nullable=True)

    # 狀態管理
    status: Mapped[str] = mapped_column(sa.Text, default="open", nullable=False)  # open, closed, confirmed, cancelled
    
    # 時間戳
    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )

    # 關聯
    join_requests: Mapped[list["TeamUpJoinRequest"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )
    participants: Mapped[list["TeamUpParticipant"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )

    # Bookings relationship (one-to-many)
    bookings: Mapped[list["Booking"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        sa.CheckConstraint("min_participants > 0", name="ck_teamup_min_participants_positive"),
        sa.CheckConstraint("max_participants >= min_participants", name="ck_teamup_max_gte_min"),
        sa.CheckConstraint("status IN ('open', 'closed', 'confirmed', 'cancelled')", name="ck_teamup_status"),
        sa.CheckConstraint("visibility IN ('public', 'invite_only', 'private')", name="ck_teamup_visibility"),
        sa.Index("ix_teamups_owner_status", "owner_user_id", "status"),
        sa.Index("ix_teamups_visibility", "visibility"),
        sa.Index("ix_teamups_invite_token", "invite_token"),
    )

