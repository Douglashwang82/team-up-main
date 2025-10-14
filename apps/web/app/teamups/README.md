# TeamUp Web Pages

This directory contains all the web pages for the TeamUp feature, which allows users to organize sports activities by creating team-ups for specific venue timeslots.

## Overview

The TeamUp feature enables users to:
- Create team-ups for available venue timeslots
- Browse and join existing team-ups
- Manage join requests as an organizer
- Track their own created and joined team-ups

## Directory Structure

```
teamups/
├── page.tsx                          # TeamUp List Page
├── new/
│   └── page.tsx                      # Create TeamUp Page
├── my/
│   └── page.tsx                      # My TeamUps Page
├── [teamupId]/
│   ├── page.tsx                      # TeamUp Detail Page
│   └── requests/
│       └── page.tsx                  # Join Requests Management Page
└── README.md                         # This file
```

## Pages

### 1. TeamUp List Page (`/teamups`)

**File:** `page.tsx`

**Purpose:** Display all available team-ups with filtering options

**Features:**
- List all available team-ups
- Filter by sport type, city, and status
- Show participant progress (current/max)
- Display team-up details: title, sport type, venue, time, participant count
- View/Join buttons for each team-up
- Create new team-up button
- Link to My TeamUps page

**Key Components:**
- Filter controls (sport type, city, status)
- Team-up cards with progress bars
- Status badges (open, confirmed, cancelled)
- Responsive layout

### 2. TeamUp Detail Page (`/teamups/[teamupId]`)

**File:** `[teamupId]/page.tsx`

**Purpose:** Display complete information about a specific team-up

**Features:**
- Complete team-up information display
- Participant list with roles
- Venue and timeslot details
- Join request form (for both members and non-members)
- Status indicators
- Owner-specific actions (link to manage requests)
- Event link (if team-up is confirmed)

**Form Fields:**
- Name (required for non-members, pre-filled for members)
- Email (optional)
- Phone (optional)
- Message/reason (optional)

**Access Control:**
- Public viewing
- Join form available for open team-ups only
- Owner sees management link
- Disabled state when at capacity or not open

### 3. Create TeamUp Page (`/teamups/new`)

**File:** `new/page.tsx`

**Purpose:** Create a new team-up

**Features:**
- Two-step process:
  1. Search and select venue timeslot
  2. Fill in team-up details
- Venue search with filters (city, date, sport type)
- Display available timeslots with venue information
- Form validation
- Authentication required

**Form Fields:**
- **Venue Selection:**
  - City (required)
  - Date (required)
  - Sport type (optional)

- **TeamUp Details:**
  - Title (required)
  - Description (optional)
  - Sport type (optional)
  - Min participants (required, default: 2)
  - Max participants (required, default: 10)
  - Application deadline (optional)

**Validation:**
- Title must not be empty
- Venue timeslot must be selected
- Min participants >= 1
- Max participants >= min participants
- Deadline must be before timeslot starts

### 4. My TeamUps Page (`/teamups/my`)

**File:** `my/page.tsx`

**Purpose:** Show team-ups created or joined by the current user

**Features:**
- Tab-based interface:
  - **Created by Me:** Team-ups the user has organized
  - **Joined by Me:** Team-ups the user has joined
- Quick access to manage requests (for owned team-ups)
- View details for all team-ups
- Empty states with call-to-action buttons
- Authentication required

**Information Displayed:**
- All standard team-up information
- Owner badge on created team-ups
- Direct links to manage requests

### 5. Join Requests Management Page (`/teamups/[teamupId]/requests`)

**File:** `[teamupId]/requests/page.tsx`

**Purpose:** Manage join requests for a team-up (owner only)

**Features:**
- Summary statistics (total, pending, reviewed)
- Separate sections for pending and reviewed requests
- Approve/reject functionality
- Display applicant information
- Capacity warnings
- Real-time status updates

**Access Control:**
- Only accessible by team-up owner
- Redirects non-owners to detail page
- Authentication required

**Request Information:**
- Applicant name, email, phone
- Application message
- Application timestamp
- Review timestamp (for reviewed requests)
- Status badge

**Actions:**
- Approve (disabled at capacity)
- Reject
- Real-time confirmation dialogs

## API Integration

### Current Status

The pages are ready but require backend API implementation. A temporary mock API is configured in `apps/web/lib/api.ts` that:
- Logs warnings when called
- Returns empty arrays or throws errors
- Provides proper TypeScript types

### Required API Endpoints

Based on PRD specifications, the following endpoints need to be implemented:

```typescript
// TeamUp Management
POST   /teamups                              // Create team-up
GET    /teamups                              // List team-ups (with filters)
GET    /teamups/{id}                         // Get team-up details
GET    /teamups/my/created                   // Get user's created team-ups
GET    /teamups/my/joined                    // Get user's joined team-ups

// Join Request Management
POST   /teamups/{id}/join                    // Submit join request
GET    /teamups/{id}/join-requests           // List join requests
POST   /teamups/{id}/join-requests/{requestId}/review  // Review request
```

### API Method Signatures

```typescript
interface TeamUpsApi {
  getTeamUps(params?: {
    sport_type?: string;
    city?: string;
    status?: string;
  }): Promise<TeamUpOut[]>;

  getTeamUpById({ id }: { id: string }): Promise<TeamUpDetail>;

  createTeamUp({ createTeamUpRequest }: {
    createTeamUpRequest: {
      court_timeslot_id: string;
      title: string;
      description?: string;
      sport_type?: string;
      min_participants: number;
      max_participants: number;
      deadline?: string;
    }
  }): Promise<TeamUpOut>;

  joinTeamUp({ id, joinTeamUpRequest }: {
    id: string;
    joinTeamUpRequest: {
      applicant_name: string;
      applicant_email?: string;
      applicant_phone?: string;
      message?: string;
    }
  }): Promise<void>;

  getMyCreatedTeamUps(): Promise<TeamUpOut[]>;

  getMyJoinedTeamUps(): Promise<TeamUpOut[]>;

  getTeamUpJoinRequests({ id }: { id: string }): Promise<JoinRequest[]>;

  reviewJoinRequest({ id, requestId, reviewJoinRequestRequest }: {
    id: string;
    requestId: string;
    reviewJoinRequestRequest: {
      approved: boolean;
    }
  }): Promise<void>;
}
```

## TypeScript Types

All pages use comprehensive TypeScript types based on the PRD:

```typescript
interface TeamUpOut {
  id: string;
  title: string;
  description?: string;
  owner_user_id: string;
  min_participants: number;
  max_participants: number;
  current_participants: number;
  deadline?: string;
  sport_type?: string;
  status: 'open' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  court_timeslot?: CourtTimeslot;
}

interface TeamUpDetail extends TeamUpOut {
  participants?: TeamUpParticipant[];
  event_id?: string;
}

interface TeamUpParticipant {
  id: string;
  user_id?: string;
  role: 'owner' | 'member';
  display_name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

interface JoinRequest {
  id: string;
  teamup_id: string;
  applicant_user_id?: string;
  applicant_name: string;
  applicant_email?: string;
  applicant_phone?: string;
  message?: string;
  status: 'submitted' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
}
```

## Styling Approach

All pages follow the existing application styling patterns:

- **Inline styles** for component-specific styling
- **Consistent color palette:**
  - Primary: `#3b82f6` (blue)
  - Success: `#10b981` (green)
  - Warning: `#f59e0b` (amber)
  - Error: `#ef4444` (red)
  - Gray shades for text and borders

- **Common patterns:**
  - Cards with border and rounded corners
  - Buttons with consistent padding and colors
  - Progress bars for participant tracking
  - Status badges with color coding
  - Grid layouts for forms and filters

## User Experience Features

### Authentication Handling
- Automatic redirect to login for protected pages
- Pre-filled forms for authenticated users
- Support for non-member join requests
- Clear authentication status indicators

### Loading States
- Loading indicators during API calls
- Disabled states for buttons during processing
- Skeleton states for better UX

### Error Handling
- User-friendly error messages
- Console logging for debugging
- Graceful fallbacks for missing data
- Confirmation dialogs for destructive actions

### Responsive Design
- Flexible layouts using CSS Grid and Flexbox
- Appropriate spacing and sizing
- Mobile-friendly touch targets
- Readable text sizing

### Progress Indicators
- Visual progress bars showing participant count
- Color-coded based on minimum participants reached
- Percentage-based width calculations
- Smooth transitions

## Integration with Existing Features

### Venues Integration
- Uses existing `VenuesApi.searchVenues()` method
- Displays venue information in team-ups
- Links to venue timeslots

### Events Integration
- Shows link to converted event when confirmed
- Uses same authentication patterns
- Consistent navigation patterns

### User Management
- Uses `AuthApi.getMe()` for user information
- Respects authentication tokens
- Pre-fills user data in forms

## Next Steps

To complete the TeamUp feature implementation:

1. **Backend Implementation:**
   - Implement TeamUp REST API endpoints
   - Generate OpenAPI specification
   - Run API client generator

2. **Update API Client:**
   ```bash
   # After backend is ready
   cd packages/api-client
   npm run generate  # or your OpenAPI generation command
   ```

3. **Update `apps/web/lib/api.ts`:**
   ```typescript
   import { TeamUpsApi } from '@team-up-main/api-client';

   export const apis = {
     // ... existing APIs
     teamups: new TeamUpsApi(config),  // Replace mock
   };
   ```

4. **Testing:**
   - Test all pages with real API
   - Verify authentication flows
   - Test error scenarios
   - Validate form submissions
   - Check responsive behavior

5. **Additional Features (Optional):**
   - Real-time updates with WebSockets
   - Notifications for request status changes
   - Search and filtering improvements
   - Participant management for owners
   - Cancel/edit team-up functionality

## Development Notes

- All pages use `'use client'` directive for client-side rendering
- Consistent with existing pages pattern
- No external dependencies beyond existing ones
- Ready for immediate deployment once API is available
- Fully typed with TypeScript
- Following Next.js 13+ app directory conventions

## Support

For questions or issues:
1. Check the PRD: `TEAMUP_PRD.md`
2. Review existing events pages for patterns
3. Verify API client configuration in `lib/api.ts`
