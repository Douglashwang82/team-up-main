# app/schemas/__init__.py
"""
Pydantic schemas for request/response validation
"""

# Auth schemas
from .auth import SignupIn, LoginIn, TokenOut

# Booking schemas
from .booking import (
    BookingCreateIn,
    BookingUpdateIn,
    BookingOut,
    BookingDetailOut,
)

# Event schemas
from .event import (
    EventCreateIn,
    EventBookTimeSlotIn,
    EventOut,
    EventDetailOut,
    EventJoinRequestCreateIn,
    EventJoinRequestReviewIn,
    EventJoinRequestOut,
    EventJoinRequestSubmitResponse,
    EventJoinRequestReviewResponse,
    EventBookingResponse,
    ParticipantOut as EventParticipantOut,
)

# Venue schemas
from .venue import (
    VenueOut,
    VenueDetailOut,
    VenueSearchOut,
    VenueSearchQueryIn,
    CourtTimeslotsQueryIn,
    CourtOut,
    TimeSlotOut,
)

__all__ = [
    # Auth
    "SignupIn",
    "LoginIn",
    "TokenOut",
    # Booking
    "BookingCreateIn",
    "BookingUpdateIn",
    "BookingOut",
    "BookingDetailOut",
    # Event
    "EventCreateIn",
    "EventBookTimeSlotIn",
    "EventOut",
    "EventDetailOut",
    "EventJoinRequestCreateIn",
    "EventJoinRequestReviewIn",
    "EventJoinRequestOut",
    "EventJoinRequestSubmitResponse",
    "EventJoinRequestReviewResponse",
    "EventBookingResponse",
    "EventParticipantOut",
    # Venue
    "VenueOut",
    "VenueDetailOut",
    "VenueSearchOut",
    "VenueSearchQueryIn",
    "CourtTimeslotsQueryIn",
    "CourtOut",
    "TimeSlotOut",
]
