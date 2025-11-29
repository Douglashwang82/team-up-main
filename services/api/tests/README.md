# API Tests

Comprehensive test suite for all API routes.

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures and test configuration
├── test_health.py           # Health check endpoint tests
├── test_auth.py             # Authentication routes tests
├── test_venues.py           # Venue search and management tests
├── test_tickets.py          # Ticket creation and listing tests
├── test_bookings.py         # Booking CRUD operations tests
├── test_notifications.py    # Notification management tests
├── test_events.py           # Event management and join requests tests
└── test_matching_service.py # Matching service tests (existing)
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run tests for a specific module
```bash
pytest tests/test_auth.py
pytest tests/test_events.py
```

### Run tests with coverage
```bash
pytest --cov=app --cov-report=html
```

### Run tests with verbose output
```bash
pytest -v
```

### Run specific test class or function
```bash
pytest tests/test_auth.py::TestLogin
pytest tests/test_auth.py::TestLogin::test_login_success
```

## Test Coverage

The test suite covers:

### Health Routes (test_health.py)
- Health check endpoint

### Auth Routes (test_auth.py)
- User signup (success, duplicate email, missing fields)
- User login (success, invalid credentials)
- Token refresh (success, invalid/expired token)
- Get current user info
- Update user profile

### Venues Routes (test_venues.py)
- List venues with various filters (location, sport type, datetime)
- Get venue by ID
- Get court time slots (with date filtering)
- Geolocation-based search
- Error handling for invalid inputs

### Tickets Routes (test_tickets.py)
- Create tickets (with required and optional fields)
- List user's tickets
- Date/time validation
- Authentication checks

### Bookings Routes (test_bookings.py)
- Create bookings (individual and event-based)
- List bookings with filtering and pagination
- Get booking details
- Update booking status and payment status
- Cancel bookings
- Ownership verification

### Notifications Routes (test_notifications.py)
- Get notifications (ordered by date)
- Mark notifications as read
- Filter by user
- Related event IDs handling

### Events Routes (test_events.py)
- Create, update, and delete events
- Book time slots for events
- List event bookings
- List and search events with filters
- Get event details with participants
- Join events (authenticated and unauthenticated)
- List and review join requests (approve/reject)
- Event capacity management
- Ownership and permission checks

## Fixtures

Common fixtures available in `conftest.py`:

- `app`: Flask test app instance
- `client`: Test client for making requests
- `db`: Database session
- `user`, `user2`: Test users
- `auth_headers`, `auth_headers_user2`: Authentication headers with JWT tokens
- `venue`: Test venue with courts and time slots
- `event`: Test event with owner as participant
- `booking`: Test booking
- `notification`: Test notification
- `ticket`: Test ticket

## Writing New Tests

When adding new tests:

1. Use existing fixtures from `conftest.py`
2. Follow the naming convention: `test_<feature>_<scenario>`
3. Organize tests into classes by feature (e.g., `TestCreateBooking`)
4. Test both success and failure cases
5. Verify authentication and authorization
6. Check error responses and status codes

Example:
```python
class TestNewFeature:
    def test_feature_success(self, client, user, auth_headers):
        response = client.post("/endpoint",
            headers=auth_headers,
            json={"data": "value"}
        )
        assert response.status_code == 201

    def test_feature_no_auth(self, client):
        response = client.post("/endpoint", json={"data": "value"})
        assert response.status_code == 401
```

## Database Setup

Tests use the same database configuration as the app but create/drop tables for each test function to ensure isolation.

## Notes

- Tests are isolated: each test function gets a fresh database
- Authentication is required for most endpoints (use `auth_headers` fixture)
- Venue fixture includes geolocation data for location-based tests
- Events automatically add the owner as a participant
