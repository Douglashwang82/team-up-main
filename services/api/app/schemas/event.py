# app/schemas/event.py
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

# Type aliases
Visibility = Literal["public", "private"]
DurationType = Literal["temporary", "permanent"]
EventStatus = Literal["open", "closed"]
JoinRequestStatus = Literal["submitted", "approved", "rejected"]
ParticipantRole = Literal["owner", "member"]

class EventCreateIn(BaseModel):
    """Schema for creating a new Event"""
    title: str
    description: Optional[str] = None
    max_participants: int
    visibility: Visibility = "public"
    duration_type: DurationType = "temporary"
    status: EventStatus = "open"

class EventBookTimeSlotIn(BaseModel):
    """Schema for booking a time slot for an Event"""
    time_slot_id: UUID

class EventJoinRequestCreateIn(BaseModel):
    """Schema for submitting a join request"""
    message: Optional[str] = None
    applicant_name: Optional[str] = None  # For non-authenticated users
    applicant_email: Optional[EmailStr] = None
    applicant_phone: Optional[str] = None

class EventJoinRequestReviewIn(BaseModel):
    """Schema for reviewing a join request"""
    action: Literal["approve", "reject"]

class ParticipantOut(BaseModel):
    """Participant information"""
    id: UUID
    user_id: Optional[UUID] = None
    display_name: Optional[str] = None
    email: Optional[str] = None
    role: ParticipantRole
    joined_at: datetime

class TimeSlotOut(BaseModel):
    """Time slot information in Event bookings"""
    id: UUID
    starts_at: datetime
    ends_at: datetime
    price_cents: Optional[int] = None
    currency: str

class CourtOut(BaseModel):
    """Court information in Event bookings"""
    id: UUID
    name: str
    sport_type: Optional[str] = None

class VenueOut(BaseModel):
    """Venue information in Event bookings"""
    id: UUID
    name: str
    address: str
    city: Optional[str] = None

class BookingOut(BaseModel):
    """Booking information in Event detail"""
    id: UUID
    status: str
    payment_status: str
    time_slot: TimeSlotOut
    court: CourtOut
    venue: VenueOut

class OwnerOut(BaseModel):
    """Owner information for events"""
    id: UUID
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

class EventOut(BaseModel):
    """Basic Event response"""
    id: UUID
    title: str
    image: Optional[str] = None
    description: Optional[str] = None
    status: EventStatus
    max_participants: int
    current_participants: int
    owner: Optional[OwnerOut] = None
    visibility: Visibility
    duration_type: DurationType
    created_at: datetime

class EventJoinRequestOut(BaseModel):
    """Join request response"""
    id: UUID
    applicant_user_id: Optional[UUID] = None
    applicant_name: str
    applicant_email: Optional[str] = None
    applicant_phone: Optional[str] = None
    message: Optional[str] = None
    status: JoinRequestStatus
    created_at: datetime
    reviewed_at: Optional[datetime] = None


class EventDetailOut(BaseModel):
    """Detailed Event response with participants and bookings"""
    id: UUID
    title: str
    image: Optional[str] = None
    description: Optional[str] = None
    status: EventStatus
    max_participants: int
    current_participants: int
    owner_user_id: UUID
    visibility: Visibility
    duration_type: DurationType
    participants: list[ParticipantOut]
    bookings: list[BookingOut]
    join_requests: list[EventJoinRequestOut]
    created_at: datetime
    updated_at: datetime

class EventJoinRequestSubmitResponse(BaseModel):
    """Response when submitting a join request"""
    id: UUID
    status: JoinRequestStatus
    message: str

class EventJoinRequestReviewResponse(BaseModel):
    """Response when reviewing a join request"""
    ok: bool
    status: JoinRequestStatus
    message: str

class EventBookingResponse(BaseModel):
    """Response when booking a time slot for Event"""
    id: UUID
    event_id: UUID
    time_slot_id: UUID
    status: str
    payment_status: str
    created_at: datetime
