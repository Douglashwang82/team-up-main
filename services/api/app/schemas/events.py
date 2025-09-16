# app/schemas/event.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

Visibility = Literal["public", "invite_only", "private"]

class EventCreateIn(BaseModel):
    booking_id: UUID
    title: str
    visibility: Visibility = "public"
    description: Optional[str] = None

class EventOut(BaseModel):
    id: UUID
    title: str
    visibility: Visibility
    invite_token: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    city: Optional[str] = None
    capacity: Optional[int] = None
    status: str

class JoinRequestCreateIn(BaseModel):
    applicant_name: str
    applicant_email: Optional[EmailStr] = None
    applicant_phone: Optional[str] = None
    message: Optional[str] = None

class JoinRequestItem(BaseModel):
    id: UUID
    applicant_name: str
    applicant_email: Optional[EmailStr] = None
    status: str

class ParticipantOut(BaseModel):
    id: UUID
    display_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: str = "member"
