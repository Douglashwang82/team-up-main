# Web App Refactoring Plan

Based on the frontend routes guide, here's the refactoring plan for the Next.js app.

## Current Structure
```
apps/web/app/
├── page.tsx                              # Home page ✓
├── auth/
│   ├── login/page.tsx                   # Login ✓
│   ├── signup/page.tsx                  # Signup ✓
│   └── logout/layout.tsx                # Logout
├── user/profile/page.tsx                # Profile (needs to move to /profile)
├── venues/page.tsx                      # Venues search ✓
├── bookings/[bookingId]/page.tsx        # Booking detail ✓
└── teamups/
    ├── page.tsx                         # Browse TeamUps ✓
    ├── new/page.tsx                     # Create TeamUp ✓
    ├── my/page.tsx                      # My TeamUps ✓
    ├── [teamupId]/page.tsx              # TeamUp detail ✓
    └── [teamupId]/requests/page.tsx      # Manage requests ✓
```

## Target Structure
```
apps/web/app/
├── page.tsx                              # ✓ Home page
├── layout.tsx                            # Root layout with providers
├── (auth)/                               # Route group for auth
│   ├── login/page.tsx                   # ✓ Login
│   ├── signup/page.tsx                  # ✓ Signup
│   └── layout.tsx                       # Auth layout (centered, no nav)
├── (main)/                               # Route group for main app
│   ├── layout.tsx                       # Main layout (with navbar)
│   ├── venues/
│   │   ├── page.tsx                     # ✓ Search venues
│   │   ├── [venueId]/
│   │   │   ├── page.tsx                 # NEW: Venue detail
│   │   │   └── courts/[courtId]/
│   │   │       └── timeslots/page.tsx   # NEW: Court timeslots
│   ├── bookings/
│   │   ├── page.tsx                     # NEW: My bookings list
│   │   ├── new/page.tsx                 # NEW: Create booking
│   │   ├── [bookingId]/
│   │   │   ├── page.tsx                 # ✓ Booking detail
│   │   │   └── edit/page.tsx            # NEW: Edit booking
│   ├── teamups/
│   │   ├── page.tsx                     # ✓ Browse TeamUps
│   │   ├── search/page.tsx              # NEW: Search with filters
│   │   ├── new/page.tsx                 # ✓ Create TeamUp
│   │   ├── my/page.tsx                  # ✓ My TeamUps
│   │   ├── [teamupId]/
│   │   │   ├── page.tsx                 # ✓ TeamUp detail
│   │   │   ├── join/page.tsx            # NEW: Join TeamUp
│   │   │   ├── edit/page.tsx            # NEW: Edit TeamUp
│   │   │   └── manage/
│   │   │       ├── page.tsx             # NEW: Manage overview
│   │   │       ├── participants/page.tsx # NEW: Manage participants
│   │   │       ├── requests/page.tsx     # ✓ Review requests (moved)
│   │   │       └── bookings/page.tsx     # NEW: Manage bookings
│   └── profile/
│       ├── page.tsx                     # View profile (moved from /user/profile)
│       ├── edit/page.tsx                # NEW: Edit profile
│       └── settings/page.tsx            # NEW: Settings
├── components/                          # Shared components
│   ├── ui/                             # UI primitives
│   ├── layouts/                        # Layout components
│   ├── features/                       # Feature-specific components
│   └── shared/                         # Shared components
├── lib/                                # Utilities
│   ├── api.ts                          # ✓ API client
│   ├── hooks/                          # Custom hooks
│   ├── utils.ts                        # ✓ Utilities
│   └── auth/                           # Auth utilities
└── middleware.ts                       # NEW: Route protection
```

## Implementation Steps

### Step 1: Setup Base Infrastructure ✓

1. Create root `layout.tsx` with providers (auth, theme)
2. Create `middleware.ts` for route protection
3. Setup route groups `(auth)` and `(main)`

### Step 2: Reorganize Existing Routes

1. Move auth routes to `(auth)` group
2. Move main routes to `(main)` group
3. Create layouts for each group

### Step 3: Add Missing Routes

**Venues:**
- `/venues/[venueId]/page.tsx` - Venue detail page
- `/venues/[venueId]/courts/[courtId]/timeslots/page.tsx` - Timeslots

**Bookings:**
- `/bookings/page.tsx` - My bookings list
- `/bookings/new/page.tsx` - Create booking
- `/bookings/[bookingId]/edit/page.tsx` - Edit booking

**TeamUps:**
- `/teamups/search/page.tsx` - Advanced search
- `/teamups/[teamupId]/join/page.tsx` - Join page
- `/teamups/[teamupId]/edit/page.tsx` - Edit TeamUp
- `/teamups/[teamupId]/manage/` - Management pages

**Profile:**
- Move from `/user/profile` to `/profile`
- Add `/profile/edit` and `/profile/settings`

### Step 4: Create Shared Components

**UI Components:**
- Button, Input, Card, Modal, etc.
- Loading states, Error boundaries
- Form components

**Feature Components:**
- VenueCard ✓
- TeamUpCard
- BookingCard
- ParticipantList
- JoinRequestList

**Layout Components:**
- Navbar ✓
- Sidebar (mobile)
- Footer
- Container/Section wrappers

### Step 5: API Integration

**Create Custom Hooks:**
- `useVenues()` - Fetch venues
- `useVenue(id)` - Fetch venue detail
- `useBookings()` - User's bookings
- `useTeamUps()` - Browse TeamUps
- `useTeamUp(id)` - TeamUp detail
- `useAuth()` - Authentication state

**API Client:**
- Extend existing `lib/api.ts`
- Add error handling
- Add loading states
- Add caching (React Query or SWR)

### Step 6: Route Guards

**Middleware Protection:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  const isProtected = !request.nextUrl.pathname.startsWith('/login')
    && !request.nextUrl.pathname.startsWith('/signup')
    && !request.nextUrl.pathname === '/';

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/teamups', request.url));
  }

  return NextResponse.next();
}
```

### Step 7: State Management

**Options:**
1. **React Context** - For auth, theme
2. **React Query / SWR** - For server state
3. **Zustand** - For client state (optional)

**Recommended Structure:**
```
lib/
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useVenues.ts
│   ├── useBookings.ts
│   └── useTeamUps.ts
```

## Migration Checklist

### Phase 1: Foundation
- [ ] Create `middleware.ts`
- [ ] Setup route groups `(auth)` and `(main)`
- [ ] Create auth context/provider
- [ ] Update root `layout.tsx` with providers

### Phase 2: Move Existing
- [ ] Move `/auth/*` to `/(auth)/*`
- [ ] Move `/user/profile` to `/(main)/profile`
- [ ] Move `/venues` to `/(main)/venues`
- [ ] Move `/bookings` to `/(main)/bookings`
- [ ] Move `/teamups` to `/(main)/teamups`

### Phase 3: Add New Routes
- [ ] Venue detail pages
- [ ] Booking CRUD pages
- [ ] TeamUp management pages
- [ ] Profile pages

### Phase 4: Components
- [ ] Extract reusable UI components
- [ ] Create feature-specific components
- [ ] Build layout components

### Phase 5: API & Data
- [ ] Create custom hooks for data fetching
- [ ] Add loading/error states
- [ ] Implement caching strategy
- [ ] Add optimistic updates

### Phase 6: Polish
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Mobile responsiveness
- [ ] Accessibility (a11y)
- [ ] SEO meta tags

## File Changes Summary

### New Files (26)
1. `middleware.ts`
2. `(auth)/layout.tsx`
3. `(main)/layout.tsx`
4. `(main)/venues/[venueId]/page.tsx`
5. `(main)/venues/[venueId]/courts/[courtId]/timeslots/page.tsx`
6. `(main)/bookings/page.tsx`
7. `(main)/bookings/new/page.tsx`
8. `(main)/bookings/[bookingId]/edit/page.tsx`
9. `(main)/teamups/search/page.tsx`
10. `(main)/teamups/[teamupId]/join/page.tsx`
11. `(main)/teamups/[teamupId]/edit/page.tsx`
12. `(main)/teamups/[teamupId]/manage/page.tsx`
13. `(main)/teamups/[teamupId]/manage/participants/page.tsx`
14. `(main)/teamups/[teamupId]/manage/bookings/page.tsx`
15. `(main)/profile/page.tsx`
16. `(main)/profile/edit/page.tsx`
17. `(main)/profile/settings/page.tsx`
18. `lib/contexts/AuthContext.tsx`
19. `lib/hooks/useAuth.ts`
20. `lib/hooks/useVenues.ts`
21. `lib/hooks/useBookings.ts`
22. `lib/hooks/useTeamUps.ts`
23. `components/ui/Button.tsx`
24. `components/features/TeamUpCard.tsx`
25. `components/features/BookingCard.tsx`
26. `components/layouts/MainLayout.tsx`

### Moved Files (9)
1. `auth/login/page.tsx` → `(auth)/login/page.tsx`
2. `auth/signup/page.tsx` → `(auth)/signup/page.tsx`
3. `user/profile/page.tsx` → `(main)/profile/page.tsx`
4. `venues/page.tsx` → `(main)/venues/page.tsx`
5. `bookings/[bookingId]/page.tsx` → `(main)/bookings/[bookingId]/page.tsx`
6. `teamups/page.tsx` → `(main)/teamups/page.tsx`
7. `teamups/new/page.tsx` → `(main)/teamups/new/page.tsx`
8. `teamups/my/page.tsx` → `(main)/teamups/my/page.tsx`
9. `teamups/[teamupId]/requests/page.tsx` → `(main)/teamups/[teamupId]/manage/requests/page.tsx`

### Updated Files (3)
1. `layout.tsx` - Add providers
2. `lib/api.ts` - Extend API client
3. `components/Navbar.tsx` - Update navigation

## Testing Strategy

1. **Manual Testing:**
   - Test all navigation flows
   - Verify route protection
   - Check mobile responsiveness

2. **Automated Testing:**
   - Unit tests for hooks
   - Integration tests for API calls
   - E2E tests for critical flows

## Deployment Notes

- Ensure environment variables are set
- Test build process: `pnpm build`
- Verify all routes are accessible
- Check for console errors/warnings

## Rollback Plan

If issues arise:
1. Keep old structure in a backup branch
2. Feature flag new routes
3. Gradual migration (route by route)
