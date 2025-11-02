# app/schemas/teamup.py
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

# Type aliases
Visibility = Literal["public", "private"]
DurationType = Literal["temporary", "permanent"]
TeamUpStatus = Literal["open", "closed"]
JoinRequestStatus = Literal["submitted", "approved", "rejected"]
ParticipantRole = Literal["owner", "member"]

class TeamUpCreateIn(BaseModel):
    """Schema for creating a new TeamUp"""
    title: str
    description: Optional[str] = None
    max_participants: int
    visibility: Visibility = "public"
    duration_type: DurationType = "temporary"
    status: TeamUpStatus = "open"

class TeamUpBookTimeSlotIn(BaseModel):
    """Schema for booking a time slot for a TeamUp"""
    time_slot_id: UUID

class JoinRequestCreateIn(BaseModel):
    """Schema for creating a join request (non-member)"""
    applicant_name: str
    applicant_email: Optional[EmailStr] = None
    applicant_phone: Optional[str] = None
    message: Optional[str] = None

class JoinRequestReviewIn(BaseModel):
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
    """Time slot information in TeamUp bookings"""
    id: UUID
    starts_at: datetime
    ends_at: datetime
    price_cents: Optional[int] = None
    currency: str

class CourtOut(BaseModel):
    """Court information in TeamUp bookings"""
    id: UUID
    name: str
    sport_type: Optional[str] = None

class VenueOut(BaseModel):
    """Venue information in TeamUp bookings"""
    id: UUID
    name: str
    address: str
    city: Optional[str] = None

class BookingOut(BaseModel):
    """Booking information in TeamUp detail"""
    id: UUID
    status: str
    payment_status: str
    time_slot: TimeSlotOut
    court: CourtOut
    venue: VenueOut

class TeamUpOut(BaseModel):
    """Basic TeamUp response"""
    id: UUID
    title: str
    description: Optional[str] = None
    status: TeamUpStatus
    max_participants: int
    current_participants: int
    visibility: Visibility
    duration_type: DurationType
    created_at: datetime

class TeamUpDetailOut(BaseModel):
    """Detailed TeamUp response with participants and bookings"""
    id: UUID
    title: str
    description: Optional[str] = None
    status: TeamUpStatus
    max_participants: int
    current_participants: int
    owner_user_id: UUID
    visibility: Visibility
    duration_type: DurationType
    participants: list[ParticipantOut]
    bookings: list[BookingOut]
    created_at: datetime
    updated_at: datetime

class JoinRequestOut(BaseModel):
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

class JoinRequestSubmitResponse(BaseModel):
    """Response when submitting a join request"""
    id: UUID
    status: JoinRequestStatus
    message: str

class JoinRequestReviewResponse(BaseModel):
    """Response when reviewing a join request"""
    ok: bool
    status: JoinRequestStatus
    message: str

class TeamUpBookingResponse(BaseModel):
    """Response when booking a time slot for TeamUp"""
    id: UUID
    teamup_id: UUID
    time_slot_id: UUID
    status: str
    payment_status: str
    created_at: datetime
