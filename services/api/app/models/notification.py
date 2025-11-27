import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False)
    
    message: Mapped[str] = mapped_column(sa.Text, nullable=False)
    type: Mapped[str] = mapped_column(sa.Text, nullable=False) # match_found, event_invite, etc.
    is_read: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    
    related_entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True) # e.g., TeamUp ID
    related_entity_type: Mapped[str | None] = mapped_column(sa.Text, nullable=True) # e.g., "teamup"

    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", backref="notifications")
