# API Schemas Guide

This document describes all Pydantic schemas used for request/response validation in the API.

## Import Structure

All schemas can be imported from `app.schemas`:

```python
from app.schemas import BookingCreateIn, TeamUpOut, VenueSearchOut
```

## Booking Schemas

### Request Schemas

**`BookingCreateIn`** - Create a new booking
```python
{
    "timeslot_id": "uuid",
    "teamup_id": "uuid | null"  # Optional TeamUp association
}
```

**`BookingUpdateIn`** - Update booking status
```python
{
    "status": "pending | confirmed | cancelled",
    "payment_status": "none | pending | succeeded | failed"
}
```

### Response Schemas

**`BookingOut`** - Basic booking response
```python
{
    "id": "uuid",
    "owner_user_id": "uuid",
    "timeslot_id": "uuid",
    "teamup_id": "uuid | null",
    "status": "string",
    "payment_status": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

**`BookingDetailOut`** - Detailed booking with related entities
```python
{
    ...BookingOut,
    "timeslot": TimeslotOut,
    "court": CourtOut,
    "venue": VenueOut,
    "teamup": TeamUpOut | null
}
```

## TeamUp Schemas

### Request Schemas

**`TeamUpCreateIn`** - Create a new TeamUp
```python
{
    "title": "string",
    "description": "string | null",
    "max_participants": "integer",
    "visibility": "public | private",
    "durantion_type": "temporary | permanent",
    "status": "open | closed"
}
```

**`TeamUpBookTimeslotIn`** - Book a timeslot for TeamUp
```python
{
    "timeslot_id": "uuid"
}
```

**`JoinRequestCreateIn`** - Submit join request
```python
{
    "applicant_name": "string",
    "applicant_email": "email | null",
    "applicant_phone": "string | null",
    "message": "string | null"
}
```

**`JoinRequestReviewIn`** - Review join request
```python
{
    "action": "approve | reject"
}
```

### Response Schemas

**`TeamUpOut`** - Basic TeamUp list response
```python
{
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "status": "open | closed",
    "max_participants": "integer",
    "current_participants": "integer",
    "visibility": "public | private",
    "durantion_type": "temporary | permanent",
    "created_at": "datetime"
}
```

**`TeamUpDetailOut`** - Detailed TeamUp response
```python
{
    ...TeamUpOut,
    "owner_user_id": "uuid",
    "participants": [ParticipantOut],
    "bookings": [BookingOut],
    "updated_at": "datetime"
}
```

**`ParticipantOut`** - TeamUp participant
```python
{
    "id": "uuid",
    "user_id": "uuid | null",
    "display_name": "string | null",
    "email": "string | null",
    "role": "owner | member",
    "joined_at": "datetime"
}
```

**`JoinRequestOut`** - Join request details
```python
{
    "id": "uuid",
    "applicant_user_id": "uuid | null",
    "applicant_name": "string",
    "applicant_email": "string | null",
    "applicant_phone": "string | null",
    "message": "string | null",
    "status": "submitted | approved | rejected",
    "created_at": "datetime",
    "reviewed_at": "datetime | null"
}
```

## Venue Schemas

### Request Schemas

**`VenueSearchQueryIn`** - Venue search parameters
```python
{
    "lat": "float | null",
    "lng": "float | null",
    "distance": "float",  # Default: 5000 (meters)
    "datetime": "string | null",  # ISO datetime or YYYY-MM-DD
    "sport_type": "string | null"
}
```

**`CourtTimeslotsQueryIn`** - Court timeslots query
```python
{
    "date": "string | null"  # YYYY-MM-DD
}
```

### Response Schemas

**`VenueOut`** - Basic venue information
```python
{
    "id": "uuid",
    "name": "string",
    "address": "string",
    "city": "string | null",
    "distance_meters": "float | null"  # Only when lat/lng provided
}
```

**`VenueDetailOut`** - Detailed venue with courts
```python
{
    "id": "uuid",
    "name": "string",
    "address": "string",
    "city": "string | null",
    "contact_phone": "string | null",
    "partner_code": "string | null",
    "courts": [CourtOut],
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

**`VenueSearchOut`** - Search results
```python
{
    "venue": VenueOut,
    "timeslots": [TimeslotOut]
}
```

**`CourtOut`** - Court information
```python
{
    "id": "uuid",
    "name": "string",
    "sport_type": "string | null"
}
```

**`TimeslotOut`** - Timeslot information
```python
{
    "id": "uuid",
    "court_id": "uuid",
    "court_name": "string | null",  # In search results
    "sport_type": "string | null",  # In search results
    "starts_at": "datetime",
    "ends_at": "datetime",
    "price_cents": "integer | null",
    "currency": "string",
    "is_bookable": "boolean"
}
```

## User Schemas

### Response Schemas

**`UserOut`** - User information (if needed)
```python
{
    "id": "uuid",
    "email": "email",
    "display_name": "string | null",
    "phone": "string | null",
    "created_at": "datetime"
}
```

## Auth Schemas

### Request Schemas

**`SignupIn`** - User registration
```python
{
    "email": "email",
    "password": "string",  # Min length: 6
    "display_name": "string | null"
}
```

**`LoginIn`** - User login
```python
{
    "email": "email",
    "password": "string"
}
```

### Response Schemas

**`TokenOut`** - Authentication tokens
```python
{
    "access_token": "string",
    "refresh_token": "string"
}
```

## Usage Examples

### In Route Handlers

```python
from flask import Blueprint, request, jsonify
from app.schemas import BookingCreateIn, BookingOut

@bp.post("/bookings")
def create_booking():
    # Validate request data
    data = BookingCreateIn(**request.get_json())

    # ... create booking logic ...

    # Return validated response
    return jsonify(BookingOut.model_dump(booking))
```

### With Pydantic Validation

```python
from pydantic import ValidationError
from app.schemas import TeamUpCreateIn

try:
    data = TeamUpCreateIn(**request_data)
except ValidationError as e:
    return jsonify({"error": "validation_failed", "details": e.errors()}), 400
```

## Schema Design Principles

1. **Separation of Concerns**: Separate schemas for input (`In`) and output (`Out`)
2. **Nested Structures**: Related entities embedded in detail responses
3. **Optional Fields**: Use `Optional[Type]` for nullable fields
4. **Type Safety**: Literal types for enums (status, visibility, etc.)
5. **Documentation**: Docstrings on all schema classes
6. **Consistency**: Common field names across related schemas

## Related Files

- Models: `services/api/app/models/`
- Routes: `services/api/app/routes/`
- Schemas: `services/api/app/schemas/`
