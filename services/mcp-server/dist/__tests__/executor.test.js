/**
 * Tests for Tool Executor
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeTool } from "../executor.js";
// Mock the api module
vi.mock("../api.js", () => ({
    apiRequest: vi.fn(),
    buildSearchParams: vi.fn((params) => {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        }
        return searchParams.toString();
    }),
}));
import { apiRequest } from "../api.js";
const mockApiRequest = vi.mocked(apiRequest);
describe("Tool Executor", () => {
    beforeEach(() => {
        mockApiRequest.mockReset();
        mockApiRequest.mockResolvedValue({});
    });
    describe("Unknown tool", () => {
        it("should throw error for unknown tool", async () => {
            await expect(executeTool("unknown_tool", {})).rejects.toThrow("Unknown tool: unknown_tool");
        });
    });
    describe("Auth tools", () => {
        it("teamup_login should call POST /auth/login", async () => {
            mockApiRequest.mockResolvedValueOnce({ access_token: "token123" });
            await executeTool("teamup_login", {
                email: "test@example.com",
                password: "password123",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/auth/login", {
                method: "POST",
                body: { email: "test@example.com", password: "password123" },
            });
        });
        it("teamup_get_current_user should call GET /auth/me with auth", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "user-123" });
            await executeTool("teamup_get_current_user", { token: "my-token" });
            expect(mockApiRequest).toHaveBeenCalledWith("/auth/me", {
                requiresAuth: true,
                token: "my-token",
            });
        });
    });
    describe("Venue tools", () => {
        it("teamup_search_venues should call GET /venues", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_search_venues", {});
            expect(mockApiRequest).toHaveBeenCalledWith("/venues");
        });
        it("teamup_search_venues should include query params", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_search_venues", {
                lat: 25.033,
                lng: 121.565,
                sport_type: "basketball",
            });
            expect(mockApiRequest).toHaveBeenCalledWith(expect.stringMatching(/\/venues\?.*lat=25\.033.*lng=121\.565.*sport_type=basketball/));
        });
        it("teamup_get_venue should call GET /venues/:id", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "venue-123" });
            await executeTool("teamup_get_venue", { venue_id: "venue-123" });
            expect(mockApiRequest).toHaveBeenCalledWith("/venues/venue-123");
        });
        it("teamup_get_court_time_slots should call correct endpoint", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_get_court_time_slots", {
                venue_id: "venue-123",
                court_id: "court-456",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/venues/venue-123/courts/court-456/time_slots");
        });
        it("teamup_get_court_time_slots should include date param", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_get_court_time_slots", {
                venue_id: "venue-123",
                court_id: "court-456",
                date: "2025-01-15",
            });
            expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining("date=2025-01-15"));
        });
    });
    describe("Event tools", () => {
        it("teamup_list_events should call GET /events", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_list_events", {});
            expect(mockApiRequest).toHaveBeenCalledWith("/events");
        });
        it("teamup_list_events should include filter params", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_list_events", {
                status: "open",
                visibility: "public",
                keyword: "basketball",
                limit: 10,
                offset: 20,
            });
            const callArg = mockApiRequest.mock.calls[0][0];
            expect(callArg).toContain("status=open");
            expect(callArg).toContain("visibility=public");
            expect(callArg).toContain("keyword=basketball");
            expect(callArg).toContain("limit=10");
            expect(callArg).toContain("offset=20");
        });
        it("teamup_get_event should call GET /events/:id", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "event-123" });
            await executeTool("teamup_get_event", { event_id: "event-123" });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/event-123", {
                requiresAuth: false,
                token: undefined,
            });
        });
        it("teamup_get_event should pass token if provided", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "event-123" });
            await executeTool("teamup_get_event", {
                event_id: "event-123",
                token: "my-token",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/event-123", {
                requiresAuth: true,
                token: "my-token",
            });
        });
        it("teamup_create_event should call POST /events", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "new-event" });
            await executeTool("teamup_create_event", {
                token: "my-token",
                title: "Basketball Game",
                description: "Weekend game",
                max_participants: 10,
                visibility: "public",
                duration_type: "temporary",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/events", {
                method: "POST",
                requiresAuth: true,
                token: "my-token",
                body: {
                    title: "Basketball Game",
                    description: "Weekend game",
                    max_participants: 10,
                    visibility: "public",
                    duration_type: "temporary",
                },
            });
        });
        it("teamup_create_event should use defaults for optional fields", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "new-event" });
            await executeTool("teamup_create_event", {
                token: "my-token",
                title: "Basketball Game",
                max_participants: 10,
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/events", {
                method: "POST",
                requiresAuth: true,
                token: "my-token",
                body: {
                    title: "Basketball Game",
                    description: undefined,
                    max_participants: 10,
                    visibility: "public",
                    duration_type: "temporary",
                },
            });
        });
        it("teamup_update_event should call PATCH /events/:id", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "event-123" });
            await executeTool("teamup_update_event", {
                token: "my-token",
                event_id: "event-123",
                title: "Updated Title",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/event-123", {
                method: "PATCH",
                requiresAuth: true,
                token: "my-token",
                body: { title: "Updated Title" },
            });
        });
        it("teamup_get_my_created_events should call GET /events/my/created", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_get_my_created_events", { token: "my-token" });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/my/created", {
                requiresAuth: true,
                token: "my-token",
            });
        });
        it("teamup_get_my_joined_events should call GET /events/my/joined", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_get_my_joined_events", { token: "my-token" });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/my/joined", {
                requiresAuth: true,
                token: "my-token",
            });
        });
    });
    describe("Join request tools", () => {
        it("teamup_request_to_join should call POST /events/:id/join", async () => {
            mockApiRequest.mockResolvedValueOnce({ ok: true });
            await executeTool("teamup_request_to_join", {
                token: "my-token",
                event_id: "event-123",
                message: "I want to join!",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/event-123/join", {
                method: "POST",
                requiresAuth: true,
                token: "my-token",
                body: { message: "I want to join!" },
            });
        });
        it("teamup_request_to_join should work without message", async () => {
            mockApiRequest.mockResolvedValueOnce({ ok: true });
            await executeTool("teamup_request_to_join", {
                token: "my-token",
                event_id: "event-123",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/event-123/join", {
                method: "POST",
                requiresAuth: true,
                token: "my-token",
                body: {},
            });
        });
        it("teamup_get_pending_requests should call GET /events/my/pending", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_get_pending_requests", { token: "my-token" });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/my/pending", {
                requiresAuth: true,
                token: "my-token",
            });
        });
        it("teamup_review_join_request should call PATCH with action", async () => {
            mockApiRequest.mockResolvedValueOnce({ ok: true });
            await executeTool("teamup_review_join_request", {
                token: "my-token",
                event_id: "event-123",
                request_id: "request-456",
                action: "approve",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/event-123/requests/request-456", {
                method: "PATCH",
                requiresAuth: true,
                token: "my-token",
                body: { action: "approve" },
            });
        });
    });
    describe("Booking tools", () => {
        it("teamup_list_bookings should call GET /bookings", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_list_bookings", { token: "my-token" });
            expect(mockApiRequest).toHaveBeenCalledWith("/bookings", {
                requiresAuth: true,
                token: "my-token",
            });
        });
        it("teamup_list_bookings should include status filter", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_list_bookings", {
                token: "my-token",
                status: "confirmed",
            });
            expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining("status=confirmed"), expect.any(Object));
        });
        it("teamup_get_booking should call GET /bookings/:id", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "booking-123" });
            await executeTool("teamup_get_booking", {
                token: "my-token",
                booking_id: "booking-123",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/bookings/booking-123", {
                requiresAuth: true,
                token: "my-token",
            });
        });
        it("teamup_book_time_slot_for_event should call POST /events/:id/book", async () => {
            mockApiRequest.mockResolvedValueOnce({ ok: true });
            await executeTool("teamup_book_time_slot_for_event", {
                token: "my-token",
                event_id: "event-123",
                time_slot_ids: ["slot-1", "slot-2"],
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/events/event-123/book", {
                method: "POST",
                requiresAuth: true,
                token: "my-token",
                body: { time_slot_ids: ["slot-1", "slot-2"] },
            });
        });
    });
    describe("Ticket tools", () => {
        it("teamup_list_tickets should call GET /tickets", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_list_tickets", { token: "my-token" });
            expect(mockApiRequest).toHaveBeenCalledWith("/tickets", {
                requiresAuth: true,
                token: "my-token",
            });
        });
        it("teamup_create_ticket should call POST /tickets", async () => {
            mockApiRequest.mockResolvedValueOnce({ id: "ticket-123" });
            await executeTool("teamup_create_ticket", {
                token: "my-token",
                date: "2025-01-20",
                start_time: "18:00",
                duration_minutes: 60,
                sport_type: "basketball",
                intensity: "Medium",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/tickets", {
                method: "POST",
                requiresAuth: true,
                token: "my-token",
                body: {
                    date: "2025-01-20",
                    start_time: "18:00",
                    duration_minutes: 60,
                    sport_type: "basketball",
                    intensity: "Medium",
                    venue_ids: undefined,
                },
            });
        });
    });
    describe("Notification tools", () => {
        it("teamup_get_notifications should call GET /notifications", async () => {
            mockApiRequest.mockResolvedValueOnce([]);
            await executeTool("teamup_get_notifications", { token: "my-token" });
            expect(mockApiRequest).toHaveBeenCalledWith("/notifications", {
                requiresAuth: true,
                token: "my-token",
            });
        });
        it("teamup_mark_notification_read should call POST /notifications/:id/read", async () => {
            mockApiRequest.mockResolvedValueOnce({ ok: true });
            await executeTool("teamup_mark_notification_read", {
                token: "my-token",
                notification_id: "notif-123",
            });
            expect(mockApiRequest).toHaveBeenCalledWith("/notifications/notif-123/read", {
                method: "POST",
                requiresAuth: true,
                token: "my-token",
            });
        });
    });
});
//# sourceMappingURL=executor.test.js.map