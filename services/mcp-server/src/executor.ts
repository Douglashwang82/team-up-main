/**
 * Tool Executor for TeamUp MCP Server
 */

import { apiRequest, buildSearchParams } from "./api.js";

export type ToolArgs = Record<string, unknown>;

/**
 * Execute a tool by name with the given arguments
 */
export async function executeTool(
  name: string,
  args: ToolArgs
): Promise<unknown> {
  switch (name) {
    // ==================== AUTH ====================
    case "teamup_login": {
      return apiRequest("/auth/login", {
        method: "POST",
        body: { email: args.email, password: args.password },
      });
    }

    case "teamup_get_current_user": {
      return apiRequest("/auth/me", {
        requiresAuth: true,
        token: args.token as string,
      });
    }

    // ==================== VENUES ====================
    case "teamup_search_venues": {
      const query = buildSearchParams({
        lat: args.lat as number | undefined,
        lng: args.lng as number | undefined,
        distance: args.distance as number | undefined,
        datetime: args.datetime as string | undefined,
        sport_type: args.sport_type as string | undefined,
      });
      return apiRequest(`/venues${query ? `?${query}` : ""}`);
    }

    case "teamup_get_venue": {
      return apiRequest(`/venues/${args.venue_id}`);
    }

    case "teamup_get_court_time_slots": {
      const query = buildSearchParams({
        date: args.date as string | undefined,
      });
      return apiRequest(
        `/venues/${args.venue_id}/courts/${args.court_id}/time_slots${query ? `?${query}` : ""}`
      );
    }

    // ==================== EVENTS ====================
    case "teamup_list_events": {
      const query = buildSearchParams({
        status: args.status as string | undefined,
        visibility: args.visibility as string | undefined,
        keyword: args.keyword as string | undefined,
        limit: args.limit as number | undefined,
        offset: args.offset as number | undefined,
      });
      return apiRequest(`/events${query ? `?${query}` : ""}`);
    }

    case "teamup_get_event": {
      return apiRequest(`/events/${args.event_id}`, {
        requiresAuth: !!args.token,
        token: args.token as string,
      });
    }

    case "teamup_create_event": {
      return apiRequest("/events", {
        method: "POST",
        requiresAuth: true,
        token: args.token as string,
        body: {
          title: args.title,
          description: args.description,
          max_participants: args.max_participants,
          visibility: args.visibility || "public",
          duration_type: args.duration_type || "temporary",
        },
      });
    }

    case "teamup_update_event": {
      const body: Record<string, unknown> = {};
      if (args.title) body.title = args.title;
      if (args.description) body.description = args.description;
      if (args.max_participants) body.max_participants = args.max_participants;
      if (args.visibility) body.visibility = args.visibility;
      if (args.status) body.status = args.status;

      return apiRequest(`/events/${args.event_id}`, {
        method: "PATCH",
        requiresAuth: true,
        token: args.token as string,
        body,
      });
    }

    case "teamup_get_my_created_events": {
      return apiRequest("/events/my/created", {
        requiresAuth: true,
        token: args.token as string,
      });
    }

    case "teamup_get_my_joined_events": {
      return apiRequest("/events/my/joined", {
        requiresAuth: true,
        token: args.token as string,
      });
    }

    // ==================== JOIN REQUESTS ====================
    case "teamup_request_to_join": {
      return apiRequest(`/events/${args.event_id}/join`, {
        method: "POST",
        requiresAuth: true,
        token: args.token as string,
        body: args.message ? { message: args.message } : {},
      });
    }

    case "teamup_get_pending_requests": {
      return apiRequest("/events/my/pending", {
        requiresAuth: true,
        token: args.token as string,
      });
    }

    case "teamup_review_join_request": {
      return apiRequest(
        `/events/${args.event_id}/requests/${args.request_id}`,
        {
          method: "PATCH",
          requiresAuth: true,
          token: args.token as string,
          body: { action: args.action },
        }
      );
    }

    // ==================== BOOKINGS ====================
    case "teamup_list_bookings": {
      const query = buildSearchParams({
        status: args.status as string | undefined,
        limit: args.limit as number | undefined,
        offset: args.offset as number | undefined,
      });
      return apiRequest(`/bookings${query ? `?${query}` : ""}`, {
        requiresAuth: true,
        token: args.token as string,
      });
    }

    case "teamup_get_booking": {
      return apiRequest(`/bookings/${args.booking_id}`, {
        requiresAuth: true,
        token: args.token as string,
      });
    }

    case "teamup_book_time_slot_for_event": {
      return apiRequest(`/events/${args.event_id}/book`, {
        method: "POST",
        requiresAuth: true,
        token: args.token as string,
        body: { time_slot_ids: args.time_slot_ids },
      });
    }

    // ==================== TICKETS ====================
    case "teamup_list_tickets": {
      return apiRequest("/tickets", {
        requiresAuth: true,
        token: args.token as string,
      });
    }

    case "teamup_create_ticket": {
      return apiRequest("/tickets", {
        method: "POST",
        requiresAuth: true,
        token: args.token as string,
        body: {
          date: args.date,
          start_time: args.start_time,
          duration_minutes: args.duration_minutes,
          sport_type: args.sport_type,
          intensity: args.intensity,
          venue_ids: args.venue_ids,
        },
      });
    }

    // ==================== NOTIFICATIONS ====================
    case "teamup_get_notifications": {
      return apiRequest("/notifications", {
        requiresAuth: true,
        token: args.token as string,
      });
    }

    case "teamup_mark_notification_read": {
      return apiRequest(`/notifications/${args.notification_id}/read`, {
        method: "POST",
        requiresAuth: true,
        token: args.token as string,
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
