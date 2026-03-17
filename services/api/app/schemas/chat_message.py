from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
import uuid

class ChatMessageIn(BaseModel):
    role: str
    content: str
    widget: Optional[Dict[str, Any]] = None

class ChatMessageOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    content: str
    widget: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
