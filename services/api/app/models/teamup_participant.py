# app/models/teamup_participant.py
import uuid, sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base

class TeamUpParticipant(Base):
    __tablename__ = "teamup_participants"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    teamup_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("teamups.id", ondelete="CASCADE"), nullable=False
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
        UUID(as_uuid=True), sa.ForeignKey("teamup_join_requests.id")
    )
    
    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
    )
    
    # 關聯
    teamup: Mapped["TeamUp"] = relationship(back_populates="participants")
    
    __table_args__ = (
        sa.CheckConstraint("role IN ('owner', 'member')", name="ck_teamup_participants_role"),
        # 確保每個 TeamUp 只有一個 owner (partial unique index)
        sa.Index("uq_teamup_participants_owner", "teamup_id", unique=True, postgresql_where=sa.text("role = 'owner'")),
        sa.Index("ix_teamup_participants_teamup", "teamup_id"),
        sa.Index("ix_teamup_participants_user", "user_id"),
    )

