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

# TeamUp schemas
from .teamup import (
    TeamUpCreateIn,
    TeamUpBookTimeslotIn,
    TeamUpOut,
    TeamUpDetailOut,
    JoinRequestCreateIn,
    JoinRequestReviewIn,
    JoinRequestOut,
    JoinRequestSubmitResponse,
    JoinRequestReviewResponse,
    TeamUpBookingResponse,
    ParticipantOut as TeamUpParticipantOut,
)

# Venue schemas
from .venue import (
    VenueOut,
    VenueDetailOut,
    VenueSearchOut,
    VenueSearchQueryIn,
    CourtTimeslotsQueryIn,
    CourtOut,
    TimeslotOut,
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
    # TeamUp
    "TeamUpCreateIn",
    "TeamUpBookTimeslotIn",
    "TeamUpOut",
    "TeamUpDetailOut",
    "JoinRequestCreateIn",
    "JoinRequestReviewIn",
    "JoinRequestOut",
    "JoinRequestSubmitResponse",
    "JoinRequestReviewResponse",
    "TeamUpBookingResponse",
    "TeamUpParticipantOut",
    # Venue
    "VenueOut",
    "VenueDetailOut",
    "VenueSearchOut",
    "VenueSearchQueryIn",
    "CourtTimeslotsQueryIn",
    "CourtOut",
    "TimeslotOut",
]
