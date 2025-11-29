# app/models/event_join_request.py
import uuid, sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base
from app.core.types import joinRequestStatus

class EventJoinRequest(Base):
    __tablename__ = "event_join_requests"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    applicant_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("users.id")
    )
    applicant_name: Mapped[str] = mapped_column(sa.Text, nullable=False)
    applicant_email: Mapped[str | None]
    applicant_phone: Mapped[str | None]
    message: Mapped[str | None]
    status: Mapped[str] = mapped_column(
        sa.Text, default=joinRequestStatus.submitted, nullable=False
    )
    
    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
    )
    reviewed_at: Mapped[sa.DateTime | None] = mapped_column(sa.DateTime(timezone=True))
    
    # 關聯
    event: Mapped["Event"] = relationship(back_populates="join_requests")
    
    __table_args__ = (
        sa.CheckConstraint(
            "status IN ('submitted', 'approved', 'rejected')", 
            name="ck_event_join_requests_status"
        ),
        sa.Index("ix_event_join_requests_event_status", "event_id", "status"),
        sa.Index("ix_event_join_requests_applicant", "applicant_user_id"),
    )

