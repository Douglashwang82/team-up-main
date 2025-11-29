# Team-Up API Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Authentication](#authentication-endpoints)
  - [Users](#users)
  - [Events](#events)
  - [Venues](#venues)
  - [Bookings](#bookings)
  - [Tickets](#tickets)
  - [Notifications](#notifications)
- [Data Models](#data-models)

---

## Overview

Team-Up API is a RESTful API service built with Flask for managing sports events, venue bookings, and user matching. The API supports geolocation-based venue searches, event management, and participant coordination.

### Technology Stack

- **Framework**: Flask 3.0.3
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: SQLAlchemy 2.0.36
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Pydantic 2.8.2

---

## Base URL

```
http://localhost:5000
```

---

## Authentication

The API uses JWT (JSON Web Token) based authentication. Protected endpoints require an `Authorization` header with a Bearer token.

### Authentication Header Format

```
Authorization: Bearer <access_token>
```

### Token Types

- **Access Token**: Short-lived token for API requests (configurable TTL)
- **Refresh Token**: Long-lived token for obtaining new access tokens (configurable TTL)

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "error_code",
  "details": "Optional detailed error message or validation errors"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

### Common Error Codes

- `validation_error`: Request data validation failed
- `authentication_required`: Missing or invalid authentication
- `not_found`: Resource not found
- `not_owner`: User is not the owner of the resource
- `invalid_credentials`: Login credentials are incorrect
- `email_taken`: Email address already registered

---

## Endpoints

### Health Check

#### Check API Health

```http
GET /health
```

**Response:**

```json
{
  "status": "ok"
}
```

---

### Authentication Endpoints

#### Sign Up

Create a new user account.

```http
POST /auth/signup
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "display_name": "John Doe"
}
```

**Response:** `201 Created`

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Responses:**

- `409`: Email already taken
- `422`: Validation error

---

#### Login

Authenticate and receive access tokens.

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Responses:**

- `401`: Invalid credentials

---

#### Refresh Token

Get new access tokens using a refresh token.

```http
POST /auth/refresh
```

**Request Body:**

```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Responses:**

- `401`: Invalid token

---

### Users

#### Get Current User

Get authenticated user's profile.

```http
GET /auth/me
```

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "display_name": "John Doe"
}
```

---

#### Update Current User

Update authenticated user's profile.

```http
PATCH /auth/me
```

**Authentication:** Required

**Request Body:**

```json
{
  "display_name": "Jane Doe"
}
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "display_name": "Jane Doe"
}
```

---

### Events

#### Create Event

Create a new event.

```http
POST /events
```

**Authentication:** Required

**Request Body:**

```json
{
  "title": "Weekend Basketball",
  "description": "Casual basketball game at downtown court",
  "max_participants": 10,
  "visibility": "public",
  "duration_type": "temporary",
  "status": "open"
}
```

**Response:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Weekend Basketball",
  "status": "open",
  "max_participants": 10,
  "current_participants": 1,
  "visibility": "public",
  "duration_type": "temporary"
}
```

**Field Descriptions:**

- `visibility`: `"public"` or `"private"`
- `duration_type`: `"temporary"` or `"permanent"`
- `status`: `"open"` or `"closed"`

---

#### List Events

Get a list of events with optional filtering.

```http
GET /events
```

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | "open" | Filter by event status (`open`, `closed`) |
| visibility | string | - | Filter by visibility (`public`, `private`) |
| limit | integer | 20 | Maximum number of results (max: 100) |
| offset | integer | 0 | Number of results to skip |

**Response:** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Weekend Basketball",
    "description": "Casual basketball game",
    "status": "open",
    "max_participants": 10,
    "current_participants": 5,
    "visibility": "public",
    "duration_type": "temporary",
    "created_at": "2025-11-29T10:00:00+00:00"
  }
]
```

---

#### Search Events

Search events by keyword.

```http
GET /events/search
```

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| keyword | string | Yes | Search keyword for event titles |
| limit | integer | No | Maximum number of results (default: 20, max: 100) |
| offset | integer | No | Number of results to skip (default: 0) |

**Response:** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Weekend Basketball",
    "description": "Casual basketball game",
    "status": "open",
    "max_participants": 10,
    "current_participants": 5,
    "visibility": "public",
    "duration_type": "temporary",
    "created_at": "2025-11-29T10:00:00+00:00"
  }
]
```

---

#### Get Event Details

Get detailed information about a specific event.

```http
GET /events/{event_id}
```

**Authentication:** Optional

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Weekend Basketball",
  "description": "Casual basketball game",
  "status": "open",
  "max_participants": 10,
  "current_participants": 5,
  "owner_user_id": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public",
  "duration_type": "temporary",
  "participants": [
    {
      "id": "participant-id",
      "user_id": "user-id",
      "display_name": "John Doe",
      "email": "john@example.com",
      "role": "owner",
      "joined_at": "2025-11-29T10:00:00+00:00"
    }
  ],
  "bookings": [
    {
      "id": "booking-id",
      "status": "confirmed",
      "payment_status": "paid",
      "time_slot": {
        "id": "timeslot-id",
        "starts_at": "2025-11-30T14:00:00+00:00",
        "ends_at": "2025-11-30T16:00:00+00:00",
        "price_cents": 5000,
        "currency": "USD"
      },
      "court": {
        "id": "court-id",
        "name": "Court A",
        "sport_type": "basketball"
      },
      "venue": {
        "id": "venue-id",
        "name": "Downtown Sports Center",
        "address": "123 Main St",
        "city": "New York"
      }
    }
  ],
  "created_at": "2025-11-29T10:00:00+00:00",
  "updated_at": "2025-11-29T10:00:00+00:00"
}
```

---

#### Update Event

Update an existing event (owner only).

```http
PUT /events/{event_id}
```

**Authentication:** Required (Owner only)

**Request Body:**

```json
{
  "title": "Updated Event Title",
  "description": "Updated description",
  "status": "closed",
  "max_participants": 12,
  "visibility": "private",
  "duration_type": "permanent"
}
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Event Title",
  "status": "closed",
  "max_participants": 12,
  "visibility": "private",
  "duration_type": "permanent"
}
```

**Error Responses:**

- `403`: Not the event owner
- `404`: Event not found

---

#### Delete Event

Delete an event (owner only).

```http
DELETE /events/{event_id}
```

**Authentication:** Required (Owner only)

**Response:** `200 OK`

```json
{
  "ok": true
}
```

---

#### Join Event

Request to join an event.

```http
POST /events/{event_id}/join
```

**Authentication:** Optional (required for registered users, optional for guest applicants)

**Request Body (for authenticated users):**

```json
{
  "message": "I'd love to join!"
}
```

**Request Body (for non-authenticated users):**

```json
{
  "applicant_name": "John Doe",
  "applicant_email": "john@example.com",
  "applicant_phone": "+1234567890",
  "message": "I'd love to join!"
}
```

**Response:** `201 Created`

```json
{
  "id": "join-request-id",
  "status": "submitted",
  "message": "Join request submitted successfully"
}
```

**Note:** If the user has a matching notification, the request is auto-approved.

**Error Responses:**

- `400`: Event not open, event full, already applied, or already joined
- `404`: Event not found

---

#### List Join Requests

Get all join requests for an event (owner only).

```http
GET /events/{event_id}/join-requests
```

**Authentication:** Required (Owner only)

**Response:** `200 OK`

```json
[
  {
    "id": "join-request-id",
    "applicant_user_id": "user-id",
    "applicant_name": "John Doe",
    "applicant_email": "john@example.com",
    "applicant_phone": "+1234567890",
    "message": "I'd love to join!",
    "status": "submitted",
    "created_at": "2025-11-29T10:00:00+00:00",
    "reviewed_at": null
  }
]
```

---

#### Review Join Request

Approve or reject a join request (owner only).

```http
POST /events/{event_id}/join-requests/{request_id}/review
```

**Authentication:** Required (Owner only)

**Request Body:**

```json
{
  "action": "approve"
}
```

**Action values:** `"approve"` or `"reject"`

**Response:** `200 OK`

```json
{
  "ok": true,
  "status": "approved",
  "message": "Request approved successfully"
}
```

**Error Responses:**

- `400`: Invalid action, already reviewed, or event full
- `403`: Not the event owner
- `404`: Event or request not found

---

#### Book Time Slot for Event

Book a venue time slot for an event (owner only).

```http
POST /events/{event_id}/book
```

**Authentication:** Required (Owner only)

**Request Body:**

```json
{
  "time_slot_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `201 Created`

```json
{
  "id": "booking-id",
  "event_id": "event-id",
  "time_slot_id": "timeslot-id",
  "status": "pending",
  "payment_status": "none",
  "created_at": "2025-11-29T10:00:00+00:00"
}
```

**Error Responses:**

- `400`: Time slot not bookable or already booked
- `403`: Not the event owner
- `404`: Event or time slot not found

---

#### List Event Bookings

Get all bookings for an event.

```http
GET /events/{event_id}/bookings
```

**Authentication:** Optional

**Response:** `200 OK`

```json
[
  {
    "id": "booking-id",
    "status": "confirmed",
    "payment_status": "paid",
    "time_slot": {
      "id": "timeslot-id",
      "starts_at": "2025-11-30T14:00:00+00:00",
      "ends_at": "2025-11-30T16:00:00+00:00",
      "price_cents": 5000,
      "currency": "USD"
    },
    "court": {
      "id": "court-id",
      "name": "Court A",
      "sport_type": "basketball"
    },
    "venue": {
      "id": "venue-id",
      "name": "Downtown Sports Center",
      "address": "123 Main St",
      "city": "New York"
    },
    "created_at": "2025-11-29T10:00:00+00:00"
  }
]
```

---

### Venues

#### List Venues

Search for venues with optional filters including geolocation, sport type, and datetime.

```http
GET /venues
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | float | No* | Latitude for geolocation search |
| lng | float | No* | Longitude for geolocation search |
| distance | float | No | Search radius in meters (default: 5000) |
| datetime | string | No | ISO datetime or date (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS) |
| sport_type | string | No | Filter by sport type |

*Note: Both `lat` and `lng` are required if using geolocation search.

**Response:** `200 OK`

```json
[
  {
    "venue": {
      "id": "venue-id",
      "name": "Downtown Sports Center",
      "address": "123 Main St",
      "city": "New York"
    },
    "distance_meters": 1234.56,
    "time_slots": [
      {
        "id": "timeslot-id",
        "court_id": "court-id",
        "starts_at": "2025-11-30T14:00:00+00:00",
        "ends_at": "2025-11-30T16:00:00+00:00",
        "price_cents": 5000,
        "currency": "USD",
        "is_bookable": true
      }
    ]
  }
]
```

**Note:** The `distance_meters` field is only included when geolocation search is used.

---

#### Get Venue Details

Get detailed information about a specific venue.

```http
GET /venues/{venue_id}
```

**Response:** `200 OK`

```json
{
  "venue": {
    "id": "venue-id",
    "name": "Downtown Sports Center",
    "address": "123 Main St",
    "city": "New York"
  },
  "courts": [
    {
      "id": "court-id",
      "name": "Court A",
      "sport_type": "basketball",
      "venue_id": "venue-id"
    }
  ]
}
```

---

#### Get Court Time Slots

Get available time slots for a specific court.

```http
GET /venues/{venue_id}/courts/{court_id}/time_slots
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | No | Filter by date (YYYY-MM-DD) |

**Response:** `200 OK`

```json
[
  {
    "id": "timeslot-id",
    "court_id": "court-id",
    "starts_at": "2025-11-30T14:00:00+00:00",
    "ends_at": "2025-11-30T16:00:00+00:00",
    "price_cents": 5000,
    "currency": "USD",
    "is_bookable": true
  }
]
```

---

### Bookings

#### Create Booking

Create a new booking for a time slot.

```http
POST /bookings
```

**Authentication:** Required

**Request Body:**

```json
{
  "time_slot_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_id": "optional-event-id"
}
```

**Response:** `201 Created`

```json
{
  "id": "booking-id",
  "owner_user_id": "user-id",
  "time_slot_id": "timeslot-id",
  "event_id": "event-id",
  "status": "pending",
  "payment_status": "none",
  "created_at": "2025-11-29T10:00:00+00:00",
  "updated_at": "2025-11-29T10:00:00+00:00"
}
```

**Error Responses:**

- `400`: Time slot not bookable or already booked
- `404`: Time slot not found

---

#### List Bookings

Get all bookings for the authenticated user.

```http
GET /bookings
```

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by booking status |
| limit | integer | 20 | Maximum number of results (max: 100) |
| offset | integer | 0 | Number of results to skip |

**Response:** `200 OK`

```json
[
  {
    "id": "booking-id",
    "owner_user_id": "user-id",
    "time_slot_id": "timeslot-id",
    "event_id": "event-id",
    "status": "pending",
    "payment_status": "none",
    "created_at": "2025-11-29T10:00:00+00:00",
    "updated_at": "2025-11-29T10:00:00+00:00"
  }
]
```

---

#### Get Booking Details

Get detailed information about a specific booking.

```http
GET /bookings/{booking_id}
```

**Authentication:** Required (Owner only)

**Response:** `200 OK`

```json
{
  "id": "booking-id",
  "owner_user_id": "user-id",
  "time_slot_id": "timeslot-id",
  "event_id": "event-id",
  "status": "confirmed",
  "payment_status": "paid",
  "time_slot": {
    "id": "timeslot-id",
    "starts_at": "2025-11-30T14:00:00+00:00",
    "ends_at": "2025-11-30T16:00:00+00:00",
    "price_cents": 5000,
    "currency": "USD"
  },
  "court": {
    "id": "court-id",
    "name": "Court A",
    "sport_type": "basketball"
  },
  "venue": {
    "id": "venue-id",
    "name": "Downtown Sports Center",
    "address": "123 Main St",
    "city": "New York"
  },
  "event": {
    "id": "event-id",
    "title": "Weekend Basketball",
    "description": "Casual game"
  },
  "created_at": "2025-11-29T10:00:00+00:00",
  "updated_at": "2025-11-29T10:00:00+00:00"
}
```

**Error Responses:**

- `403`: Not the booking owner
- `404`: Booking not found

---

#### Update Booking

Update booking status or payment status.

```http
PATCH /bookings/{booking_id}
```

**Authentication:** Required (Owner only)

**Request Body:**

```json
{
  "status": "confirmed",
  "payment_status": "paid"
}
```

**Response:** `200 OK`

```json
{
  "id": "booking-id",
  "owner_user_id": "user-id",
  "time_slot_id": "timeslot-id",
  "event_id": "event-id",
  "status": "confirmed",
  "payment_status": "paid",
  "created_at": "2025-11-29T10:00:00+00:00",
  "updated_at": "2025-11-29T10:00:00+00:00"
}
```

**Error Responses:**

- `403`: Not the booking owner
- `404`: Booking not found

---

#### Cancel Booking

Cancel a booking.

```http
DELETE /bookings/{booking_id}
```

**Authentication:** Required (Owner only)

**Response:** `200 OK`

```json
{
  "ok": true,
  "message": "Booking cancelled successfully"
}
```

**Error Responses:**

- `403`: Not the booking owner
- `404`: Booking not found

---

### Tickets

Tickets are used for the matching service to find compatible players and events.

#### Create Ticket

Create a new ticket for matching.

```http
POST /tickets
```

**Authentication:** Required

**Request Body:**

```json
{
  "date": "2025-12-01",
  "start_time": "14:00",
  "duration_minutes": 120,
  "sport_type": "basketball",
  "intensity": "medium",
  "venue_ids": ["venue-id-1", "venue-id-2"],
  "price_min": 1000,
  "price_max": 5000,
  "currency": "USD"
}
```

**Field Descriptions:**

- `date`: Date in YYYY-MM-DD format
- `start_time`: Time in HH:MM or HH:MM:SS format
- `duration_minutes`: Duration in minutes
- `sport_type`: Type of sport
- `intensity`: Intensity level
- `venue_ids`: Optional array of preferred venue IDs
- `price_min`: Optional minimum price in cents
- `price_max`: Optional maximum price in cents
- `currency`: Currency code (default: USD)

**Response:** `201 Created`

```json
{
  "id": "ticket-id",
  "status": "pending",
  "message": "Ticket created and matching started"
}
```

**Error Responses:**

- `400`: Missing required fields or invalid date/time format

---

#### List Tickets

Get all tickets for the authenticated user.

```http
GET /tickets
```

**Authentication:** Required

**Response:** `200 OK`

```json
[
  {
    "id": "ticket-id",
    "date": "2025-12-01",
    "start_time": "14:00:00",
    "sport_type": "basketball",
    "status": "pending",
    "created_at": "2025-11-29T10:00:00+00:00"
  }
]
```

---

### Notifications

#### Get Notifications

Get all notifications for the authenticated user.

```http
GET /notifications
```

**Authentication:** Required

**Response:** `200 OK`

```json
[
  {
    "id": "notification-id",
    "message": "You have a match for your basketball ticket!",
    "type": "match_found",
    "is_read": false,
    "related_event_ids": ["event-id-1", "event-id-2"],
    "created_at": "2025-11-29T10:00:00+00:00"
  }
]
```

---

#### Mark Notification as Read

Mark a notification as read.

```http
POST /notifications/{notification_id}/read
```

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "message": "Marked as read"
}
```

**Error Responses:**

- `404`: Notification not found

---

## Data Models

### User

```typescript
{
  id: UUID
  email: string
  display_name: string | null
  phone: string | null
  created_at: datetime
}
```

---

### Event

```typescript
{
  id: UUID
  title: string
  description: string | null
  owner_user_id: UUID
  max_participants: integer
  visibility: "public" | "private"
  duration_type: "temporary" | "permanent"
  status: "open" | "closed"
  invite_token: string | null
  created_at: datetime
  updated_at: datetime
}
```

---

### Event Participant

```typescript
{
  id: UUID
  event_id: UUID
  user_id: UUID | null
  role: "owner" | "member"
  display_name: string
  email: string
  phone: string | null
  join_request_id: UUID | null
  created_at: datetime
}
```

---

### Event Join Request

```typescript
{
  id: UUID
  event_id: UUID
  applicant_user_id: UUID | null
  applicant_name: string
  applicant_email: string
  applicant_phone: string | null
  message: string | null
  status: "submitted" | "approved" | "rejected"
  created_at: datetime
  reviewed_at: datetime | null
}
```

---

### Venue

```typescript
{
  id: UUID
  name: string
  address: string
  city: string | null
  geo_point: Geography | null  // PostGIS POINT
  contact_phone: string | null
  partner_code: string | null
  created_at: datetime
  updated_at: datetime
}
```

---

### Court

```typescript
{
  id: UUID
  venue_id: UUID
  name: string
  sport_type: string | null
  created_at: datetime
  updated_at: datetime
}
```

---

### Time Slot

```typescript
{
  id: UUID
  court_id: UUID
  starts_at: datetime
  ends_at: datetime
  price_cents: integer | null
  currency: string  // ISO 3-letter code
  is_bookable: boolean
  created_at: datetime
  updated_at: datetime
}
```

---

### Booking

```typescript
{
  id: UUID
  owner_user_id: UUID
  time_slot_id: UUID
  event_id: UUID | null
  status: "pending" | "confirmed" | "cancelled"
  payment_status: "none" | "pending" | "paid" | "refunded"
  created_at: datetime
  updated_at: datetime
}
```

---

### Ticket

```typescript
{
  id: UUID
  user_id: UUID
  date: date
  start_time: time
  duration_minutes: integer
  sport_type: string
  intensity: string
  venue_ids: UUID[] | null
  price_min: integer | null
  price_max: integer | null
  currency: string
  status: string
  created_at: datetime
}
```

---

### Notification

```typescript
{
  id: UUID
  user_id: UUID
  message: string
  type: string
  is_read: boolean
  related_event_ids: UUID[] | null
  created_at: datetime
}
```

---

## Additional Notes

### PostGIS Support

The API uses PostgreSQL with the PostGIS extension for geolocation features. Venue searches support:

- Distance-based filtering using latitude/longitude
- Spheroid calculations for accurate distances
- GiST indexing for optimized spatial queries

### Time Slot Constraints

Time slots have the following constraints:

- No overlapping time slots for the same court (enforced by EXCLUDE constraint)
- End time must be after start time
- Prices must be non-negative
- Currency codes must be 3-letter uppercase ISO codes

### Event Workflow

1. User creates an event (automatically becomes owner and first participant)
2. Other users can request to join (authenticated or as guests)
3. Event owner reviews and approves/rejects join requests
4. Event owner can book time slots for the event
5. Participants can view event details and bookings

### Matching Service

The ticket-based matching service:

1. Users create tickets with preferences (sport type, time, location, price)
2. System automatically matches tickets with compatible events
3. Users receive notifications when matches are found
4. Matched users can auto-join events with approval

---

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
