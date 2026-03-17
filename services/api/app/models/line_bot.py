from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import uuid
from app.core.db import Base

class LineBotConfig(Base):
    __tablename__ = "line_bot_configs"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # 這是用來放在 webhook 網址的唯一字串 (可以對外公開的 ID)
    bot_id: Mapped[str] = mapped_column(String, unique=True, index=True, default=lambda: uuid.uuid4().hex)
    
    channel_secret: Mapped[str] = mapped_column(String, nullable=False)
    channel_access_token: Mapped[str] = mapped_column(String, nullable=False)
    
    # Optional LLM configs
    llm_api_key: Mapped[str | None] = mapped_column(String, nullable=True)
    llm_model: Mapped[str | None] = mapped_column(String, nullable=True, default="gemini-2.5-flash")
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # 關聯到 User
    # owner = relationship("User", back_populates="line_bots") # Optional, depending on if you want it on the User model
