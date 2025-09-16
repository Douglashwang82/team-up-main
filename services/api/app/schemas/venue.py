# app/schemas/venue.py
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class VenueOut(BaseModel):
    id: UUID
    name: str
    address: str
    city: Optional[str] = None

class VenueTimeslotOut(BaseModel):
    id: UUID
    venue_id: UUID
    starts_at: datetime
    ends_at: datetime
    sport_type: Optional[str] = None
    price_cents: Optional[int] = None
    currency: str = "USD"
    is_bookable: bool

class VenueSearchOut(BaseModel):
    venue: VenueOut
    timeslots: list[VenueTimeslotOut]

class BookingCreateIn(BaseModel):
    timeslot_id: UUID

class BookingOut(BaseModel):
    id: UUID
    status: str
    payment_status: str
