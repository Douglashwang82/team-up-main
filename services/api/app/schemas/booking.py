# app/schemas/booking.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class BookingCreateIn(BaseModel):
    """Schema for creating a new booking"""
    timeslot_id: UUID
    teamup_id: Optional[UUID] = None  # Optional TeamUp association

class BookingUpdateIn(BaseModel):
    """Schema for updating booking status"""
    status: Optional[str] = None  # pending, confirmed, cancelled
    payment_status: Optional[str] = None  # none, pending, succeeded, failed

class TimeslotOut(BaseModel):
    """Timeslot information in booking response"""
    id: UUID
    starts_at: datetime
    ends_at: datetime
    price_cents: Optional[int] = None
    currency: str

class CourtOut(BaseModel):
    """Court information in booking response"""
    id: UUID
    name: str
    sport_type: Optional[str] = None

class VenueOut(BaseModel):
    """Venue information in booking response"""
    id: UUID
    name: str
    address: str
    city: Optional[str] = None

class TeamUpOut(BaseModel):
    """TeamUp information in booking response"""
    id: UUID
    title: str
    description: Optional[str] = None

class BookingOut(BaseModel):
    """Basic booking response"""
    id: UUID
    owner_user_id: UUID
    timeslot_id: UUID
    teamup_id: Optional[UUID] = None
    status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime

class BookingDetailOut(BaseModel):
    """Detailed booking response with related entities"""
    id: UUID
    owner_user_id: UUID
    timeslot_id: UUID
    teamup_id: Optional[UUID] = None
    status: str
    payment_status: str
    timeslot: TimeslotOut
    court: CourtOut
    venue: VenueOut
    teamup: Optional[TeamUpOut] = None
    created_at: datetime
    updated_at: datetime
