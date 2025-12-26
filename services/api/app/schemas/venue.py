# app/schemas/venue.py
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.models.venue import Venue, Court, TimeSlot

class VenueOut(BaseModel):
    """Basic venue information"""
    id: UUID
    name: str
    address: str
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_meters: Optional[float] = None  # Only present when lat/lng provided

class CourtOut(BaseModel):
    """Court information"""
    id: UUID
    name: str
    sport_type: Optional[str] = None

class TimeSlotOut(BaseModel):
    """Timeslot information"""
    id: UUID
    court_id: UUID
    court_name: Optional[str] = None  # Added in search results
    sport_type: Optional[str] = None  # Added in search results
    starts_at: datetime
    ends_at: datetime
    price_cents: Optional[int] = None
    currency: str = "USD"
    is_bookable: bool

class VenueSearchOut(BaseModel):
    """Response for venue search endpoint"""
    venue: VenueOut
    time_slots: list[TimeSlotOut]

class VenueDetailOut(BaseModel):
    """Detailed venue information with courts"""
    id: UUID
    name: str
    address: str
    city: Optional[str] = None
    contact_phone: Optional[str] = None
    partner_code: Optional[str] = None
    courts: list[CourtOut]
    created_at: datetime
    updated_at: datetime

class VenueSearchQueryIn(BaseModel):
    """Query parameters for venue search"""
    lat: Optional[float] = None
    lng: Optional[float] = None
    distance: Optional[float] = 5000  # Default 5km in meters
    datetime: Optional[str] = None  # ISO datetime or YYYY-MM-DD
    sport_type: Optional[str] = None

class CourtTimeslotsQueryIn(BaseModel):
    """Query parameters for getting court time slots"""
    date: Optional[str] = None  # YYYY-MM-DD format
