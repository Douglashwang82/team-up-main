from pydantic import BaseModel, Field
from typing import Literal

Sport = Literal["basketball","badminton","running","gym","tennis"]

class EventCreateIn(BaseModel):
    title: str
    sport: Sport
    starts_at: str  # ISO8601
    ends_at: str
    capacity: int = Field(gt=0)
    lat: float
    lng: float
    address: str | None = None
