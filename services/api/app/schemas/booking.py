# app/schemas/booking.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class BookingCreateIn(BaseModel):
    """Schema for creating a new booking"""
    time_slot_id: UUID
    event_id: Optional[UUID] = None  # Optional Event association

class BookingUpdateIn(BaseModel):
    """Schema for updating booking status"""
    status: Optional[str] = None  # pending, confirmed, cancelled
    payment_status: Optional[str] = None  # none, pending, succeeded, failed

class TimeSlotOut(BaseModel):
    """Time slot information in booking response"""
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

class EventOut(BaseModel):
    """Event information in booking response"""
    id: UUID
    title: str
    description: Optional[str] = None

class BookingOut(BaseModel):
    """Basic booking response"""
    id: UUID
    owner_user_id: UUID
    time_slot_id: UUID
    event_id: Optional[UUID] = None
    status: str
    payment_status: str
    amount_paid: Optional[int] = None
    currency: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class BookingDetailOut(BaseModel):
    """Detailed booking response with related entities"""
    id: UUID
    owner_user_id: UUID
    time_slot_id: UUID
    event_id: Optional[UUID] = None
    status: str
    payment_status: str
    amount_paid: Optional[int] = None
    currency: Optional[str] = None
    time_slot: TimeSlotOut
    court: CourtOut
    venue: VenueOut
    event: Optional[EventOut] = None
    created_at: datetime
    updated_at: datetime
