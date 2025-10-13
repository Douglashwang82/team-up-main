# app/models/event_teamup.py
"""
Junction table for Event ↔ TeamUp many-to-many relationship
Allows Events to have multiple TeamUps and TeamUps to be associated with multiple Events
"""
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base


class EventTeamUp(Base):
    __tablename__ = "event_teamups"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    
    # Event reference
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    
    # TeamUp reference
    teamup_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("teamups.id", ondelete="CASCADE"), nullable=False
    )
    
    # Relationship metadata
    is_primary: Mapped[bool] = mapped_column(
        sa.Boolean, default=False, nullable=False
    )
    priority: Mapped[int] = mapped_column(
        sa.Integer, default=1, nullable=False
    )
    
    # Relationship details
    relationship_type: Mapped[str] = mapped_column(
        sa.Text, default="participant", nullable=False
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
    event: Mapped["Event"] = relationship(back_populates="teamups")
    teamup: Mapped["TeamUp"] = relationship(back_populates="events")
    
    __table_args__ = (
        # Prevent duplicate Event-TeamUp combinations
        sa.UniqueConstraint("event_id", "teamup_id", name="uq_event_teamup"),
        
        # Ensure only one primary TeamUp per Event
        sa.UniqueConstraint("event_id", "is_primary", name="uq_event_primary_teamup"),
        
        # Relationship type validation
        sa.CheckConstraint(
            "relationship_type IN ('participant', 'organizer', 'sponsor', 'partner')",
            name="ck_event_teamup_relationship_type"
        ),
        
        # Contribution validation
        sa.CheckConstraint(
            "(contribution_percentage IS NULL) OR (contribution_percentage >= 0 AND contribution_percentage <= 100)",
            name="ck_event_teamup_contribution_percentage_valid"
        ),
        
        # Status validation
        sa.CheckConstraint(
            "status IN ('active', 'cancelled', 'completed', 'suspended')",
            name="ck_event_teamup_status"
        ),
        
        # Indexes for performance
        sa.Index("ix_event_teamups_event", "event_id"),
        sa.Index("ix_event_teamups_teamup", "teamup_id"),
        sa.Index("ix_event_teamups_primary", "event_id", "is_primary"),
        sa.Index("ix_event_teamups_status", "status"),
        sa.Index("ix_event_teamups_relationship_type", "relationship_type"),
    )
