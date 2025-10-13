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
    # Legacy single timeslot reference (deprecated, use timeslots relationship instead)
    court_timeslot_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("court_timeslots.id", ondelete="CASCADE"), nullable=True
    )
    title: Mapped[str] = mapped_column(sa.Text, nullable=False)
    description: Mapped[str | None]
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
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
    # Legacy single timeslot relationship (deprecated)
    court_timeslot = relationship("CourtTimeslot", back_populates="teamups")
    
    # New many-to-many timeslot relationship
    timeslots: Mapped[list["TeamUpTimeslot"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )
    
    join_requests: Mapped[list["TeamUpJoinRequest"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )
    participants: Mapped[list["TeamUpParticipant"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )
    
    # New booking assignment relationship
    booking_assignments: Mapped[list["BookingAssignment"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )
    
    # New many-to-many Event relationship
    events: Mapped[list["EventTeamUp"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )
    
    # Legacy TeamUp many-to-many booking relationship (deprecated, use assignments instead)
    bookings: Mapped[list["TeamUpBooking"]] = relationship(
        back_populates="teamup", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        sa.CheckConstraint("min_participants > 0", name="ck_teamup_min_participants_positive"),
        sa.CheckConstraint("max_participants >= min_participants", name="ck_teamup_max_gte_min"),
        sa.CheckConstraint("status IN ('open', 'closed', 'confirmed', 'cancelled')", name="ck_teamup_status"),
        sa.CheckConstraint("visibility IN ('public', 'invite_only', 'private')", name="ck_teamup_visibility"),
        sa.Index("ix_teamups_court_timeslot_status", "court_timeslot_id", "status"),
        sa.Index("ix_teamups_owner_status", "owner_user_id", "status"),
        sa.Index("ix_teamups_visibility", "visibility"),
        sa.Index("ix_teamups_invite_token", "invite_token"),
    )

