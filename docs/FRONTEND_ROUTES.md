# Frontend Routes Structure

Recommended frontend routing structure for the TeamUp application.

## Route Organization

```
/                           # Public home page
├── /auth
│   ├── /login             # Login page
│   ├── /signup            # Signup page
│   └── /logout            # Logout (redirect)
│
├── /venues                # Venue search & browsing
│   ├── /                  # Search venues (map + list view)
│   ├── /:venueId          # Venue detail page
│   └── /:venueId/courts/:courtId/timeslots  # Court timeslots
│
├── /bookings              # User's bookings
│   ├── /                  # My bookings list
│   ├── /new               # Create new booking (select timeslot)
│   ├── /:bookingId        # Booking details
│   └── /:bookingId/edit   # Edit booking (change status/payment)
│
├── /teamups               # TeamUp browsing & management
│   ├── /                  # Browse public TeamUps
│   ├── /search            # Search TeamUps with filters
│   ├── /new               # Create new TeamUp
│   ├── /:teamupId         # TeamUp detail page
│   ├── /:teamupId/edit    # Edit TeamUp (owner only)
│   ├── /:teamupId/join    # Join TeamUp page
│   ├── /:teamupId/manage  # Manage TeamUp (owner only)
│   │   ├── /participants  # Manage participants
│   │   ├── /requests      # Review join requests
│   │   └── /bookings      # Manage TeamUp bookings
│   └── /my                # My TeamUps (as owner or member)
│
├── /profile               # User profile
│   ├── /                  # View profile
│   ├── /edit              # Edit profile
│   └── /settings          # User settings
│
└── /help                  # Help & documentation
    ├── /                  # Help home
    ├── /how-it-works      # How TeamUp works
    └── /faq               # FAQ
```

## Detailed Route Specifications

### Public Routes (No Authentication Required)

#### `/` - Home Page
**Purpose**: Landing page with app introduction
- Hero section with value proposition
- Feature highlights
- Search bar (venues/TeamUps)
- Popular TeamUps section
- Call-to-action (Sign up / Browse venues)

#### `/auth/login` - Login Page
**Purpose**: User login
- Email/password form
- "Forgot password" link
- "Don't have an account? Sign up" link
- Social login options (optional)

#### `/auth/signup` - Signup Page
**Purpose**: New user registration
- Email/password/display_name form
- Terms & conditions checkbox
- "Already have an account? Login" link

#### `/venues` - Venue Search
**Purpose**: Search and browse venues
- Map view with venue markers
- List view with filters
- **Filters**:
  - Location (geolocation or city search)
  - Distance radius slider
  - Date picker
  - Time range
  - Sport type dropdown
- Click venue → navigate to `/venues/:venueId`

**API Call**: `GET /venues?lat=X&lng=Y&distance=Z&datetime=...&sport_type=...`

#### `/venues/:venueId` - Venue Detail
**Purpose**: View venue details and available courts
- Venue info (name, address, map, contact)
- List of courts with sport types
- "View Timeslots" button for each court
- Click court → navigate to timeslots page

**API Call**: `GET /venues/:venueId`

#### `/venues/:venueId/courts/:courtId/timeslots` - Court Timeslots
**Purpose**: View and book available timeslots
- Calendar view with available slots
- Price display per slot
- "Book Now" button (requires login)
- Filter by date

**API Call**: `GET /venues/:venueId/courts/:courtId/timeslots?date=YYYY-MM-DD`

#### `/teamups` - Browse TeamUps
**Purpose**: Browse public TeamUps
- Grid/List view of open TeamUps
- **Filters**:
  - Status (open/closed)
  - Sport type
  - City
  - Date range
- TeamUp cards showing:
  - Title, description
  - Participants count (current/max)
  - Associated bookings (venue, date, time)
  - "View Details" button

**API Call**: `GET /teamups?status=open&visibility=public`

#### `/teamups/:teamupId` - TeamUp Detail
**Purpose**: View TeamUp details and join
- TeamUp info (title, description, owner)
- Participant list
- Bookings list (venue, date, time)
- "Join TeamUp" button
- Owner actions (if owner):
  - Edit TeamUp
  - Manage requests
  - Book additional timeslots

**API Call**: `GET /teamups/:teamupId`

---

### Protected Routes (Authentication Required)

#### `/bookings` - My Bookings
**Purpose**: View user's all bookings
- List/Grid of bookings
- **Filters**:
  - Status (pending/confirmed/cancelled)
  - Date range
- Each booking shows:
  - Venue, court, timeslot
  - TeamUp association (if any)
  - Payment status
  - Actions (view, cancel)

**API Call**: `GET /bookings?status=...`

#### `/bookings/new` - Create Booking
**Purpose**: Create a new booking
- Two flows:
  1. **Individual Booking**: Select venue → court → timeslot
  2. **TeamUp Booking**: Associated with TeamUp (owner only)
- Summary with price
- Payment method selection
- Confirm button

**API Call**: `POST /bookings`

#### `/bookings/:bookingId` - Booking Detail
**Purpose**: View booking details
- Full booking information
- Venue details with map
- Court and timeslot info
- Payment status
- Actions:
  - Update status (confirm/cancel)
  - Update payment status
  - Cancel booking

**API Call**: `GET /bookings/:bookingId`

#### `/teamups/new` - Create TeamUp
**Purpose**: Create a new TeamUp
- Form fields:
  - Title (required)
  - Description
  - Max participants (required)
  - Visibility (public/private)
  - Duration type (temporary/permanent)
- Preview of TeamUp
- Create button

**API Call**: `POST /teamups`

#### `/teamups/:teamupId/join` - Join TeamUp
**Purpose**: Submit join request
- Display TeamUp details
- Join request form:
  - Message to owner
  - Auto-filled user info
- Submit button

**API Call**: `POST /teamups/:teamupId/join`

#### `/teamups/:teamupId/manage` - Manage TeamUp (Owner Only)
**Purpose**: TeamUp management dashboard
- Tabs:
  1. **Overview**: Stats, edit TeamUp
  2. **Participants**: List of members, remove option
  3. **Join Requests**: Pending requests, approve/reject
  4. **Bookings**: All TeamUp bookings, book new timeslots

**API Calls**:
- `GET /teamups/:teamupId`
- `GET /teamups/:teamupId/join-requests`
- `POST /teamups/:teamupId/join-requests/:requestId/review`
- `GET /teamups/:teamupId/bookings`
- `POST /teamups/:teamupId/book`

#### `/teamups/:teamupId/manage/requests` - Join Requests (Owner Only)
**Purpose**: Review join requests
- List of pending requests
- Each request shows:
  - Applicant name, email, phone
  - Message
  - Submitted date
- Actions: Approve / Reject

**API Call**: `POST /teamups/:teamupId/join-requests/:requestId/review`

#### `/teamups/:teamupId/manage/bookings` - TeamUp Bookings (Owner Only)
**Purpose**: Manage TeamUp bookings
- List of all bookings
- "Book New Timeslot" button
- Each booking shows:
  - Venue, court, timeslot
  - Payment status
  - Actions (view, cancel)

**API Calls**:
- `GET /teamups/:teamupId/bookings`
- `POST /teamups/:teamupId/book`

#### `/teamups/my` - My TeamUps
**Purpose**: User's TeamUps (as owner or member)
- Tabs:
  - **As Owner**: TeamUps I created
  - **As Member**: TeamUps I joined
- Quick actions:
  - View, Manage (if owner)
  - Leave (if member)

**API Call**: `GET /teamups` (filter client-side based on user)

#### `/profile` - User Profile
**Purpose**: View user profile
- Display name, email
- Join date
- Statistics:
  - Total bookings
  - TeamUps joined
  - TeamUps owned

#### `/profile/edit` - Edit Profile
**Purpose**: Edit user information
- Update display name
- Update phone
- Change password

---

## Route Guards & Navigation

### Authentication Guards

```typescript
// Pseudo-code for route guards

// Public routes - redirect to dashboard if already logged in
PublicOnlyRoutes = ['/auth/login', '/auth/signup']

// Protected routes - redirect to login if not authenticated
ProtectedRoutes = [
  '/bookings/*',
  '/teamups/new',
  '/teamups/*/manage',
  '/teamups/my',
  '/profile/*'
]

// Owner-only routes - check ownership
OwnerOnlyRoutes = [
  '/teamups/:id/manage/*',
  '/teamups/:id/edit'
]
```

### Navigation Flow Examples

#### 1. Book a Venue (Individual)
```
/ → /venues → /venues/:id → /venues/:id/courts/:courtId/timeslots
  → (login if needed) → /bookings/new → /bookings/:id (confirmation)
```

#### 2. Create & Join TeamUp
```
/ → /teamups/new → /teamups/:id (created) → /teamups/:id/manage/bookings
  → book timeslot → /teamups/:id (view as public)
  → other user joins → /teamups/:id/join → (owner reviews)
  → /teamups/:id/manage/requests → approve
```

#### 3. Browse & Join TeamUp
```
/ → /teamups → /teamups/:id → /teamups/:id/join → (wait for approval)
  → notification → /teamups/:id (now shows bookings)
```

---

## Mobile Responsive Considerations

### Bottom Navigation (Mobile)
- Home
- Search (Venues/TeamUps)
- My Bookings
- Profile

### Key Mobile Views
1. **Map-first venue search**
2. **Swipeable timeslot calendar**
3. **Card-based TeamUp browsing**
4. **Quick actions (Join, Book)**

---

## State Management Routes

### URL Query Parameters

**Venue Search**: `/venues?lat=25.03&lng=121.56&distance=5000&sport=basketball&date=2025-10-20`

**TeamUp Search**: `/teamups?status=open&sport=badminton&city=Taipei`

**Bookings Filter**: `/bookings?status=confirmed&from=2025-10-01&to=2025-10-31`

---

## SEO & Meta Tags

### Dynamic Meta Tags per Route

```typescript
Routes with Dynamic SEO:
- /venues/:id → Title: "{Venue Name} | TeamUp"
- /teamups/:id → Title: "{TeamUp Title} | TeamUp"
- /teamups → Title: "Browse Sports TeamUps | TeamUp"
```

---

## Analytics Events

Track key user actions:
- `page_view` - All routes
- `venue_search` - /venues
- `teamup_created` - /teamups/new
- `join_request_sent` - /teamups/:id/join
- `booking_created` - /bookings/new
- `booking_confirmed` - /bookings/:id/edit

---

## Progressive Web App (PWA) Routes

### Offline-First Routes
- `/` - Home (cached)
- `/venues` - Last search results (cached)
- `/bookings` - User's bookings (cached)
- `/teamups/my` - User's TeamUps (cached)

### Push Notification Deep Links
- `/teamups/:id?notification=join_request_approved`
- `/bookings/:id?notification=payment_reminder`

---

## Example Route Configuration (React Router)

```typescript
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth',
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },
  {
    path: '/venues',
    children: [
      { index: true, element: <VenueSearchPage /> },
      { path: ':venueId', element: <VenueDetailPage /> },
      {
        path: ':venueId/courts/:courtId/timeslots',
        element: <CourtTimeslotsPage />,
      },
    ],
  },
  {
    path: '/bookings',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <MyBookingsPage /> },
      { path: 'new', element: <CreateBookingPage /> },
      { path: ':bookingId', element: <BookingDetailPage /> },
    ],
  },
  {
    path: '/teamups',
    children: [
      { index: true, element: <BrowseTeamUpsPage /> },
      { path: 'new', element: <ProtectedRoute><CreateTeamUpPage /></ProtectedRoute> },
      { path: ':teamupId', element: <TeamUpDetailPage /> },
      { path: ':teamupId/join', element: <JoinTeamUpPage /> },
      {
        path: ':teamupId/manage',
        element: <OwnerOnlyRoute />,
        children: [
          { index: true, element: <ManageTeamUpPage /> },
          { path: 'requests', element: <ManageRequestsPage /> },
          { path: 'bookings', element: <ManageBookingsPage /> },
        ],
      },
      { path: 'my', element: <ProtectedRoute><MyTeamUpsPage /></ProtectedRoute> },
    ],
  },
  {
    path: '/profile',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <ProfilePage /> },
      { path: 'edit', element: <EditProfilePage /> },
    ],
  },
]);
```

---

## Next Steps

1. **Design wireframes** for each route
2. **Implement route guards** with authentication checks
3. **Add loading states** for data fetching
4. **Implement error boundaries** for each route
5. **Add breadcrumbs** for navigation context
6. **Setup analytics** tracking per route
7. **Test deep linking** for all routes
8. **Optimize for SEO** with dynamic meta tags
