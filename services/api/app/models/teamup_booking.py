# app/models/teamup_booking.py
"""
Junction table for TeamUp ↔ Booking many-to-many relationship
Allows TeamUps to have multiple bookings and bookings to be shared across TeamUps
"""
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base


class TeamUpBooking(Base):
    __tablename__ = "teamup_bookings"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    
    # TeamUp reference
    teamup_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("teamups.id", ondelete="CASCADE"), nullable=False
    )
    
    # Booking reference
    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False
    )
    
    # Relationship metadata
    is_primary: Mapped[bool] = mapped_column(
        sa.Boolean, default=False, nullable=False
    )
    priority: Mapped[int] = mapped_column(
        sa.Integer, default=1, nullable=False
    )
    
    # Booking contribution details
    contribution_amount_cents: Mapped[int | None] = mapped_column(
        sa.Integer, nullable=True
    )
    contribution_percentage: Mapped[float | None] = mapped_column(
        sa.Numeric(5, 2), nullable=True  # e.g., 25.50 for 25.5%
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
    teamup: Mapped["TeamUp"] = relationship(back_populates="bookings")
    booking: Mapped["Booking"] = relationship(back_populates="teamups")
    
    __table_args__ = (
        # Prevent duplicate TeamUp-Booking combinations
        sa.UniqueConstraint("teamup_id", "booking_id", name="uq_teamup_booking"),
        
        # Ensure only one primary booking per TeamUp
        sa.UniqueConstraint("teamup_id", "is_primary", name="uq_teamup_primary_booking"),
        
        # Contribution validation
        sa.CheckConstraint(
            "(contribution_amount_cents IS NULL) OR (contribution_amount_cents >= 0)",
            name="ck_teamup_booking_contribution_non_negative"
        ),
        sa.CheckConstraint(
            "(contribution_percentage IS NULL) OR (contribution_percentage >= 0 AND contribution_percentage <= 100)",
            name="ck_teamup_booking_percentage_valid"
        ),
        
        # Status validation
        sa.CheckConstraint(
            "status IN ('active', 'cancelled', 'completed')",
            name="ck_teamup_booking_status"
        ),
        
        # Indexes for performance
        sa.Index("ix_teamup_bookings_teamup", "teamup_id"),
        sa.Index("ix_teamup_bookings_booking", "booking_id"),
        sa.Index("ix_teamup_bookings_primary", "teamup_id", "is_primary"),
        sa.Index("ix_teamup_bookings_status", "status"),
    )
