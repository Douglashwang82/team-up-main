/**
 * API Client for Team-Up Mobile App
 * Direct integration with Flask backend
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  UpdateUserRequest,
  Event,
  EventDetails,
  CreateEventRequest,
  UpdateEventRequest,
  EventListParams,
  EventSearchParams,
  JoinEventRequest,
  JoinEventResponse,
  EventJoinRequest,
  ReviewJoinRequestRequest,
  BookTimeSlotRequest,
  EventBooking,
  VenueSearchParams,
  VenueResult,
  VenueDetails,
  Booking,
  BookingDetails,
  BookingListParams,
  CreateBookingRequest,
  UpdateBookingRequest,
  Notification,
  APIError,
} from "./types";

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
const localhost = Platform.select({
  ios: "http://localhost:8080",
  android: "http://10.0.2.2:8080",
});

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || localhost || "http://localhost:8080";

// ===[ Token Management ]===

const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("refreshToken");
  } catch {
    return null;
  }
};

export const setTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = async (): Promise<void> => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
};

// ===[ HTTP Client ]===

let refreshPromise: Promise<void> | null = null;

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${BASE_URL}${endpoint}`;
  const accessToken = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 with token refresh
  if (response.status === 401 && !endpoint.includes("/auth/")) {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearTokens();
      throw new Error("Authentication required");
    }

    // Use singleton refresh promise to avoid race conditions
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error("Token refresh failed");
          }

          const data: AuthResponse = await refreshResponse.json();
          await setTokens(data.access_token, data.refresh_token);
        } catch (error) {
          await clearTokens();
          throw error;
        }
      })().finally(() => {
        refreshPromise = null;
      });
    }

    await refreshPromise;

    // Retry original request with new token
    const newAccessToken = await getAccessToken();
    if (newAccessToken) {
      headers["Authorization"] = `Bearer ${newAccessToken}`;
    }

    response = await fetch(url, {
      ...options,
      headers,
    });
  }

  return response;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);

  if (!response.ok) {
    const error: APIError = await response.json().catch(() => ({
      error: "request_failed",
      details: response.statusText,
    }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// ===[ Auth API ]===

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return request<User>("/auth/me");
  },

  updateCurrentUser: async (data: UpdateUserRequest): Promise<User> => {
    return request<User>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// ===[ Events API ]===

export const eventsApi = {
  create: async (data: CreateEventRequest): Promise<Event> => {
    return request<Event>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  list: async (params?: EventListParams): Promise<Event[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.visibility)
      searchParams.append("visibility", params.visibility);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const query = searchParams.toString();
    return request<Event[]>(`/events${query ? `?${query}` : ""}`);
  },

  search: async (params: EventSearchParams): Promise<Event[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append("keyword", params.keyword);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());

    return request<Event[]>(`/events?${searchParams.toString()}`);
  },

  get: async (id: string): Promise<EventDetails> => {
    return request<EventDetails>(`/events/${id}`);
  },

  update: async (id: string, data: UpdateEventRequest): Promise<Event> => {
    return request<Event>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ ok: boolean }> => {
    return request<{ ok: boolean }>(`/events/${id}`, {
      method: "DELETE",
    });
  },

  join: async (
    id: string,
    data?: JoinEventRequest,
  ): Promise<JoinEventResponse> => {
    return request<JoinEventResponse>(`/events/${id}/join`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    });
  },

  splitBill: async (
    id: string,
    data: { total_amount: number; participant_ids?: string[] },
  ): Promise<any> => {
    return request(`/events/${id}/split-bill`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateParticipantPayment: async (
    id: string,
    participantId: string,
    paymentStatus: "paid" | "unpaid",
  ): Promise<any> => {
    return request(`/events/${id}/participants/${participantId}/payment`, {
      method: "PATCH",
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
  },

  listJoinRequests: async (id: string): Promise<EventJoinRequest[]> => {
    return request<EventJoinRequest[]>(`/events/${id}/join-requests`);
  },

  reviewJoinRequest: async (
    eventId: string,
    requestId: string,
    data: ReviewJoinRequestRequest,
  ): Promise<{ ok: boolean; status: string; message: string }> => {
    return request(`/events/${eventId}/join-requests/${requestId}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  bookTimeSlot: async (
    id: string,
    data: BookTimeSlotRequest,
  ): Promise<Booking> => {
    return request<Booking>(`/events/${id}/book`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listBookings: async (id: string): Promise<EventBooking[]> => {
    return request<EventBooking[]>(`/events/${id}/bookings`);
  },

  getOwnedEvents: async (): Promise<{ id: string; title: string; max_participants: number; participant_count: number }[]> => {
    return request(`/events/owned`);
  },

  inviteUser: async (eventId: string, userId: string): Promise<{ ok: boolean; message: string }> => {
    return request(`/events/${eventId}/invite`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

// ===[ Venues API ]===

export const venuesApi = {
  search: async (params: VenueSearchParams): Promise<VenueResult[]> => {
    const searchParams = new URLSearchParams();
    if (params.lat !== undefined)
      searchParams.append("lat", params.lat.toString());
    if (params.lng !== undefined)
      searchParams.append("lng", params.lng.toString());
    if (params.distance)
      searchParams.append("distance", params.distance.toString());
    if (params.datetime) searchParams.append("datetime", params.datetime);
    if (params.sport_type) searchParams.append("sport_type", params.sport_type);

    return request<VenueResult[]>(`/venues?${searchParams.toString()}`);
  },

  get: async (id: string): Promise<VenueDetails> => {
    return request<VenueDetails>(`/venues/${id}`);
  },

  getCourtTimeSlots: async (
    venueId: string,
    courtId: string,
    date?: string,
  ): Promise<any[]> => {
    const searchParams = new URLSearchParams();
    if (date) searchParams.append("date", date);

    const query = searchParams.toString();
    return request<any[]>(
      `/venues/${venueId}/courts/${courtId}/time_slots${query ? `?${query}` : ""}`,
    );
  },
};

// ===[ Bookings API ]===

export const bookingsApi = {
  create: async (data: CreateBookingRequest): Promise<Booking> => {
    return request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  list: async (params?: BookingListParams): Promise<Booking[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const query = searchParams.toString();
    return request<Booking[]>(`/bookings${query ? `?${query}` : ""}`);
  },

  get: async (id: string): Promise<BookingDetails> => {
    return request<BookingDetails>(`/bookings/${id}`);
  },

  update: async (id: string, data: UpdateBookingRequest): Promise<Booking> => {
    return request<Booking>(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: string): Promise<{ ok: boolean; message: string }> => {
    return request(`/bookings/${id}`, {
      method: "DELETE",
    });
  },
};



// ===[ Notifications API ]===

export const notificationsApi = {
  list: async (): Promise<Notification[]> => {
    return request<Notification[]>("/notifications");
  },

  markAsRead: async (id: string): Promise<{ message: string }> => {
    return request(`/notifications/${id}/read`, {
      method: "POST",
    });
  },
};

// ===[ Health API ]===

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    return request<{ status: string }>("/health");
  },
};

// ===[ User API ]===

export const userApi = {
  updateUserInfo: async (data: Partial<UpdateUserRequest>): Promise<User> => {
    return request<User>("/user/info", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  events: eventsApi,
  venues: venuesApi,
  bookings: bookingsApi,
  notifications: notificationsApi,
  health: healthApi,
  user: userApi,
};

export default api;
