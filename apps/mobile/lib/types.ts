/**
 * TypeScript types matching the refactored Team-Up API
 * Based on services/api/API_DOCUMENTATION.md
 */

// ===[ Auth Types ]===

export interface SignupRequest {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ===[ User Types ]===

export interface User {
  id: string;
  email: string;
  display_name: string;
}

export interface UpdateUserRequest {
  display_name?: string;
}

// ===[ Event Types ]===

export type EventVisibility = "public" | "private";
export type EventDurationType = "temporary" | "permanent";
export type EventStatus = "open" | "closed";

export interface Event {
  id: string;
  title: string;
  image?: string | null;
  description?: string | null;
  status: EventStatus;
  max_participants: number;
  current_participants: number;
  owner_user_id: string;
  visibility: EventVisibility;
  duration_type: EventDurationType;
  created_at: string;
  updated_at?: string;
}

export interface EventDetails extends Event {
  participants: EventParticipant[];
  bookings: EventBooking[];
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  max_participants: number;
  visibility?: EventVisibility;
  duration_type?: EventDurationType;
  status?: EventStatus;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  status?: EventStatus;
  max_participants?: number;
  visibility?: EventVisibility;
  duration_type?: EventDurationType;
}

export interface EventParticipant {
  id: string;
  user_id?: string | null;
  display_name: string;
  email: string;
  role: "owner" | "member";
  joined_at: string;
}

export interface JoinEventRequest {
  message?: string;
  // For non-authenticated users
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
}

export interface JoinEventResponse {
  id: string;
  status: "submitted" | "approved";
  message: string;
}

export interface EventJoinRequest {
  id: string;
  applicant_user_id?: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string | null;
  message?: string | null;
  status: "submitted" | "approved" | "rejected";
  created_at: string;
  reviewed_at?: string | null;
}

export interface ReviewJoinRequestRequest {
  action: "approve" | "reject";
}

// ===[ Venue Types ]===

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface Court {
  id: string;
  name: string;
  sport_type: string;
  venue_id?: string;
}

export interface TimeSlot {
  id: string;
  court_id: string;
  starts_at: string;
  ends_at: string;
  price_cents?: number | null;
  currency: string;
  is_bookable: boolean;
}

export interface VenueSearchParams {
  lat?: number;
  lng?: number;
  distance?: number; // in meters
  datetime?: string; // ISO datetime or YYYY-MM-DD
  sport_type?: string;
}

export interface VenueResult {
  venue: Venue;
  time_slots: TimeSlot[];
  distance_meters?: number;
}

export interface VenueDetails {
  venue: Venue;
  courts: Court[];
}

// ===[ Booking Types ]===

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "none" | "pending" | "paid" | "refunded";

export interface Booking {
  id: string;
  owner_user_id: string;
  time_slot_id: string;
  event_id?: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingDetails extends Booking {
  time_slot: TimeSlot;
  court: Court;
  venue: Venue;
  event?: {
    id: string;
    title: string;
    description?: string | null;
  } | null;
}

export interface EventBooking {
  id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  time_slot: TimeSlot;
  court: Court;
  venue: Venue;
  created_at?: string;
}

export interface CreateBookingRequest {
  time_slot_id: string;
  event_id?: string;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  payment_status?: PaymentStatus;
}

export interface BookTimeSlotRequest {
  time_slot_id: string;
}

// ===[ Ticket Types ]===

export interface Ticket {
  id: string;
  date: string;
  start_time: string;
  sport_type: string;
  status: string;
  created_at: string;
}

export interface TicketDetails extends Ticket {
  duration_minutes: number;
  intensity: string;
  venue_ids?: string[];
  price_min?: number;
  price_max?: number;
  currency?: string;
  matched_events: {
    id: string;
    title: string;
    description?: string;
    sport_type: string;
    status: string;
    start_time?: string;
  }[];
}

export interface CreateTicketRequest {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM or HH:MM:SS
  duration_minutes: number;
  sport_type: string;
  intensity: string;
  venue_ids?: string[];
  price_min?: number;
  price_max?: number;
  currency?: string;
}

// ===[ Notification Types ]===

export interface Notification {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  related_event_ids: string[];
  created_at: string;
}

// ===[ Error Types ]===

export interface APIError {
  error: string;
  details?: any;
}

// ===[ Pagination & Query Types ]===

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface EventListParams extends PaginationParams {
  status?: EventStatus;
  visibility?: EventVisibility;
}

export interface EventSearchParams extends PaginationParams {
  keyword: string;
}

export interface BookingListParams extends PaginationParams {
  status?: BookingStatus;
}
