from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid

class LineBotConfigCreate(BaseModel):
    channel_secret: str
    channel_access_token: str
    llm_api_key: Optional[str] = None
    llm_model: Optional[str] = "gemini-2.5-flash"

class LineBotConfigUpdate(BaseModel):
    channel_secret: Optional[str] = None
    channel_access_token: Optional[str] = None
    llm_api_key: Optional[str] = None
    llm_model: Optional[str] = None
    is_active: Optional[bool] = None

class LineBotConfigResponse(BaseModel):
    id: uuid.UUID
    bot_id: str
    channel_secret: str
    channel_access_token: str
    llm_api_key: Optional[str] = None
    llm_model: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
