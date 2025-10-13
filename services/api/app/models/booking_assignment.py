# app/models/booking_assignment.py
"""
Booking assignment model for assigning bookings to TeamUps or Events
Ensures bookings have owners and can be assigned to different entities
"""
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base


class BookingAssignment(Base):
    __tablename__ = "booking_assignments"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    
    # Booking reference
    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False
    )
    
    # Assignment target (one of these will be populated)
    teamup_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("teamups.id", ondelete="CASCADE")
    )
    event_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE")
    )
    
    # Assignment metadata
    assignment_type: Mapped[str] = mapped_column(
        sa.Text, nullable=False  # 'teamup' or 'event'
    )
    is_primary: Mapped[bool] = mapped_column(
        sa.Boolean, default=False, nullable=False
    )
    priority: Mapped[int] = mapped_column(
        sa.Integer, default=1, nullable=False
    )
    
    # Assignment details
    assigned_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False
    )
    assignment_reason: Mapped[str | None] = mapped_column(
        sa.Text, nullable=True
    )
    
    # Status tracking
    status: Mapped[str] = mapped_column(
        sa.Text, default="active", nullable=False
    )
    
    # Timestamps
    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.text("now()"), onupdate=sa.func.now(), nullable=False
    )
    
    # Relationships
    booking: Mapped["Booking"] = relationship(back_populates="assignments")
    teamup: Mapped["TeamUp"] = relationship(back_populates="booking_assignments")
    event: Mapped["Event"] = relationship(back_populates="booking_assignments")
    assigned_by_user: Mapped["User"] = relationship(foreign_keys=[assigned_by_user_id])
    
    __table_args__ = (
        # Ensure exactly one assignment target is specified
        sa.CheckConstraint(
            "(teamup_id IS NOT NULL AND event_id IS NULL AND assignment_type = 'teamup') OR "
            "(teamup_id IS NULL AND event_id IS NOT NULL AND assignment_type = 'event')",
            name="ck_booking_assignment_exactly_one_target"
        ),
        
        # Prevent duplicate assignments
        sa.UniqueConstraint("booking_id", "teamup_id", name="uq_booking_teamup_assignment"),
        sa.UniqueConstraint("booking_id", "event_id", name="uq_booking_event_assignment"),
        
        # Ensure only one primary assignment per booking
        sa.UniqueConstraint("booking_id", "is_primary", name="uq_booking_primary_assignment"),
        
        # Assignment type validation
        sa.CheckConstraint(
            "assignment_type IN ('teamup', 'event')",
            name="ck_booking_assignment_type"
        ),
        
        # Status validation
        sa.CheckConstraint(
            "status IN ('active', 'cancelled', 'completed', 'transferred')",
            name="ck_booking_assignment_status"
        ),
        
        # Indexes for performance
        sa.Index("ix_booking_assignments_booking", "booking_id"),
        sa.Index("ix_booking_assignments_teamup", "teamup_id"),
        sa.Index("ix_booking_assignments_event", "event_id"),
        sa.Index("ix_booking_assignments_type", "assignment_type"),
        sa.Index("ix_booking_assignments_primary", "booking_id", "is_primary"),
        sa.Index("ix_booking_assignments_status", "status"),
        sa.Index("ix_booking_assignments_assigned_by", "assigned_by_user_id"),
    )
