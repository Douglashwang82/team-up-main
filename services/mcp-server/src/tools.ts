/**
 * MCP Tool Definitions for TeamUp API
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const tools: Tool[] = [
  // ==================== AUTH ====================
  {
    name: "teamup_login",
    description:
      "Login to TeamUp and get an authentication token. Use this token for authenticated requests.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "User email address" },
        password: { type: "string", description: "User password" },
      },
      required: ["email", "password"],
    },
  },
  {
    name: "teamup_get_current_user",
    description:
      "Get information about the currently authenticated user. Requires authentication token.",
    inputSchema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "Authentication token from login",
        },
      },
      required: ["token"],
    },
  },

  // ==================== VENUES ====================
  {
    name: "teamup_search_venues",
    description:
      "Search for sports venues with available time slots. Can filter by location, sport type, and date/time.",
    inputSchema: {
      type: "object",
      properties: {
        lat: {
          type: "number",
          description: "Latitude coordinate for location-based search",
        },
        lng: {
          type: "number",
          description: "Longitude coordinate for location-based search",
        },
        distance: {
          type: "number",
          description: "Search radius in meters (default: 5000)",
        },
        datetime: {
          type: "string",
          description:
            "Filter by date/time (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)",
        },
        sport_type: {
          type: "string",
          description:
            "Filter by sport type (e.g., basketball, tennis, badminton)",
        },
      },
    },
  },
  {
    name: "teamup_get_venue",
    description: "Get detailed information about a specific venue by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        venue_id: { type: "string", description: "UUID of the venue" },
      },
      required: ["venue_id"],
    },
  },
  {
    name: "teamup_get_court_time_slots",
    description:
      "Get available time slots for a specific court at a venue. Can filter by date.",
    inputSchema: {
      type: "object",
      properties: {
        venue_id: { type: "string", description: "UUID of the venue" },
        court_id: { type: "string", description: "UUID of the court" },
        date: {
          type: "string",
          description: "Filter by date (format: YYYY-MM-DD)",
        },
      },
      required: ["venue_id", "court_id"],
    },
  },

  // ==================== EVENTS ====================
  {
    name: "teamup_list_events",
    description:
      "List and search TeamUp events. Can filter by status, visibility, and search by keyword.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["open", "closed"],
          description: "Filter by event status (default: open)",
        },
        visibility: {
          type: "string",
          enum: ["public", "private"],
          description: "Filter by visibility",
        },
        keyword: {
          type: "string",
          description: "Search keyword to find events by title",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 20, max: 100)",
        },
        offset: {
          type: "number",
          description: "Number of results to skip for pagination",
        },
      },
    },
  },
  {
    name: "teamup_get_event",
    description:
      "Get detailed information about a specific TeamUp event including participants.",
    inputSchema: {
      type: "object",
      properties: {
        event_id: { type: "string", description: "UUID of the event" },
        token: {
          type: "string",
          description: "Optional auth token for private event access",
        },
      },
      required: ["event_id"],
    },
  },
  {
    name: "teamup_create_event",
    description:
      "Create a new TeamUp event. The creator becomes the event owner. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "Authentication token from login",
        },
        title: { type: "string", description: "Event title" },
        description: { type: "string", description: "Event description" },
        max_participants: {
          type: "number",
          description: "Maximum number of participants",
        },
        visibility: {
          type: "string",
          enum: ["public", "private"],
          description: "Event visibility (default: public)",
        },
        duration_type: {
          type: "string",
          enum: ["temporary", "permanent"],
          description:
            "Whether this is a one-time or recurring event (default: temporary)",
        },
      },
      required: ["token", "title", "max_participants"],
    },
  },
  {
    name: "teamup_update_event",
    description:
      "Update an existing TeamUp event. Only the event owner can update. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
        event_id: { type: "string", description: "UUID of the event to update" },
        title: { type: "string", description: "New event title" },
        description: { type: "string", description: "New event description" },
        max_participants: {
          type: "number",
          description: "New maximum participants",
        },
        visibility: {
          type: "string",
          enum: ["public", "private"],
          description: "New visibility setting",
        },
        status: {
          type: "string",
          enum: ["open", "closed"],
          description: "New event status",
        },
      },
      required: ["token", "event_id"],
    },
  },
  {
    name: "teamup_get_my_created_events",
    description:
      "Get events created by the authenticated user. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
      },
      required: ["token"],
    },
  },
  {
    name: "teamup_get_my_joined_events",
    description:
      "Get events the authenticated user has joined as a participant. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
      },
      required: ["token"],
    },
  },

  // ==================== JOIN REQUESTS ====================
  {
    name: "teamup_request_to_join",
    description:
      "Request to join a TeamUp event. Requires authentication. The event owner will need to approve.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
        event_id: { type: "string", description: "UUID of the event to join" },
        message: {
          type: "string",
          description: "Optional message to the event owner",
        },
      },
      required: ["token", "event_id"],
    },
  },
  {
    name: "teamup_get_pending_requests",
    description:
      "Get pending join requests for events you own. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
      },
      required: ["token"],
    },
  },
  {
    name: "teamup_review_join_request",
    description:
      "Approve or reject a join request for your event. Requires authentication as the event owner.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
        event_id: { type: "string", description: "UUID of the event" },
        request_id: {
          type: "string",
          description: "UUID of the join request to review",
        },
        action: {
          type: "string",
          enum: ["approve", "reject"],
          description: "Whether to approve or reject the request",
        },
      },
      required: ["token", "event_id", "request_id", "action"],
    },
  },

  // ==================== BOOKINGS ====================
  {
    name: "teamup_list_bookings",
    description:
      "List the authenticated user's bookings. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
        status: {
          type: "string",
          enum: ["pending", "confirmed", "cancelled"],
          description: "Filter by booking status",
        },
        limit: { type: "number", description: "Maximum results" },
        offset: { type: "number", description: "Pagination offset" },
      },
      required: ["token"],
    },
  },
  {
    name: "teamup_get_booking",
    description: "Get details of a specific booking. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
        booking_id: { type: "string", description: "UUID of the booking" },
      },
      required: ["token", "booking_id"],
    },
  },
  {
    name: "teamup_book_time_slot_for_event",
    description:
      "Book a time slot for a TeamUp event. Only the event owner can book. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
        event_id: { type: "string", description: "UUID of the event" },
        time_slot_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of time slot UUIDs to book",
        },
      },
      required: ["token", "event_id", "time_slot_ids"],
    },
  },

  // ==================== TICKETS ====================
  {
    name: "teamup_list_tickets",
    description:
      "List the authenticated user's matching tickets. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
      },
      required: ["token"],
    },
  },
  {
    name: "teamup_create_ticket",
    description:
      "Create a matching ticket to find playing partners. The system will match you with others who have compatible tickets.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
        date: {
          type: "string",
          description: "Preferred date (format: YYYY-MM-DD)",
        },
        start_time: {
          type: "string",
          description: "Preferred start time (format: HH:MM)",
        },
        duration_minutes: {
          type: "number",
          description: "Preferred duration in minutes",
        },
        sport_type: {
          type: "string",
          description: "Sport type (e.g., basketball, tennis)",
        },
        intensity: {
          type: "string",
          enum: ["Low", "Medium", "High"],
          description: "Preferred intensity level",
        },
        venue_ids: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of preferred venue UUIDs",
        },
      },
      required: ["token", "date", "start_time", "duration_minutes", "sport_type"],
    },
  },

  // ==================== NOTIFICATIONS ====================
  {
    name: "teamup_get_notifications",
    description:
      "Get the authenticated user's notifications. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
      },
      required: ["token"],
    },
  },
  {
    name: "teamup_mark_notification_read",
    description: "Mark a notification as read. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Authentication token" },
        notification_id: {
          type: "string",
          description: "UUID of the notification",
        },
      },
      required: ["token", "notification_id"],
    },
  },
];

// Tool names for validation
export const TOOL_NAMES = tools.map((t) => t.name);

// Get tool by name
export function getToolByName(name: string): Tool | undefined {
  return tools.find((t) => t.name === name);
}
