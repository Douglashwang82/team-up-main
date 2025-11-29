# app/models/event_participant.py
import uuid, sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base

class EventParticipant(Base):
    __tablename__ = "event_participants"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("users.id")
    )
    role: Mapped[str] = mapped_column(sa.Text, default="member", nullable=False)
    
    display_name: Mapped[str]
    email: Mapped[str]
    phone: Mapped[str]
    
    # 關聯到 join_request（如果有的話）
    join_request_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("event_join_requests.id")
    )
    
    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
    )
    
    # 關聯
    event: Mapped["Event"] = relationship(back_populates="participants")
    
    __table_args__ = (
        sa.CheckConstraint("role IN ('owner', 'member')", name="ck_event_participants_role"),
        # 確保每個 Event 只有一個 owner (partial unique index)
        sa.Index("uq_event_participants_owner", "event_id", unique=True, postgresql_where=sa.text("role = 'owner'")),
        sa.Index("ix_event_participants_event", "event_id"),
        sa.Index("ix_event_participants_user", "user_id"),
    )

