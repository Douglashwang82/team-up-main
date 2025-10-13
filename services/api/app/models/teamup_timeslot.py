# app/models/teamup_timeslot.py
"""
Junction table for TeamUp ↔ Timeslot many-to-many relationship
Supports both CourtTimeslot and VenueTimeslot relationships
"""
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base


class TeamUpTimeslot(Base):
    __tablename__ = "teamup_timeslots"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    
    # TeamUp reference
    teamup_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("teamups.id", ondelete="CASCADE"), nullable=False
    )
    
    # Timeslot references (one of these will be populated)
    court_timeslot_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("court_timeslots.id", ondelete="CASCADE")
    )
    venue_timeslot_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("venue_timeslots.id", ondelete="CASCADE")
    )
    
    # Relationship metadata
    is_preferred: Mapped[bool] = mapped_column(
        sa.Boolean, default=False, nullable=False
    )
    priority: Mapped[int] = mapped_column(
        sa.Integer, default=1, nullable=False
    )
    
    # Timestamps
    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
    )
    
    # Relationships
    teamup: Mapped["TeamUp"] = relationship(back_populates="timeslots")
    court_timeslot: Mapped["CourtTimeslot"] = relationship(back_populates="teamups")
    venue_timeslot: Mapped["VenueTimeslot"] = relationship(back_populates="teamups")
    
    __table_args__ = (
        # Ensure exactly one timeslot is specified
        sa.CheckConstraint(
            "(court_timeslot_id IS NOT NULL AND venue_timeslot_id IS NULL) OR "
            "(court_timeslot_id IS NULL AND venue_timeslot_id IS NOT NULL)",
            name="ck_teamup_timeslot_exactly_one"
        ),
        # Prevent duplicate TeamUp-Timeslot combinations
        sa.UniqueConstraint(
            "teamup_id", "court_timeslot_id", name="uq_teamup_court_timeslot"
        ),
        sa.UniqueConstraint(
            "teamup_id", "venue_timeslot_id", name="uq_teamup_venue_timeslot"
        ),
        # Indexes for performance
        sa.Index("ix_teamup_timeslots_teamup", "teamup_id"),
        sa.Index("ix_teamup_timeslots_court", "court_timeslot_id"),
        sa.Index("ix_teamup_timeslots_venue", "venue_timeslot_id"),
        sa.Index("ix_teamup_timeslots_preferred", "teamup_id", "is_preferred"),
    )

