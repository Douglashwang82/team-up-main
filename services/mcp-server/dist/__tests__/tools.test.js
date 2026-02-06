/**
 * Tests for MCP Tool Definitions
 */
import { describe, it, expect } from "vitest";
import { tools, getToolByName, TOOL_NAMES } from "../tools.js";
describe("Tool Definitions", () => {
    describe("tools array", () => {
        it("should have 21 tools defined", () => {
            expect(tools).toHaveLength(21);
        });
        it("should have unique tool names", () => {
            const names = tools.map((t) => t.name);
            const uniqueNames = new Set(names);
            expect(uniqueNames.size).toBe(names.length);
        });
        it("all tools should have name, description, and inputSchema", () => {
            for (const tool of tools) {
                expect(tool.name).toBeDefined();
                expect(typeof tool.name).toBe("string");
                expect(tool.name.length).toBeGreaterThan(0);
                expect(tool.description).toBeDefined();
                expect(typeof tool.description).toBe("string");
                expect(tool.description.length).toBeGreaterThan(0);
                expect(tool.inputSchema).toBeDefined();
                expect(tool.inputSchema.type).toBe("object");
                expect(tool.inputSchema.properties).toBeDefined();
            }
        });
        it("all tool names should start with teamup_", () => {
            for (const tool of tools) {
                expect(tool.name.startsWith("teamup_")).toBe(true);
            }
        });
    });
    describe("TOOL_NAMES constant", () => {
        it("should match the tools array", () => {
            expect(TOOL_NAMES).toHaveLength(tools.length);
            for (const name of TOOL_NAMES) {
                expect(tools.find((t) => t.name === name)).toBeDefined();
            }
        });
    });
    describe("getToolByName", () => {
        it("should return the correct tool", () => {
            const tool = getToolByName("teamup_login");
            expect(tool).toBeDefined();
            expect(tool?.name).toBe("teamup_login");
        });
        it("should return undefined for unknown tools", () => {
            const tool = getToolByName("unknown_tool");
            expect(tool).toBeUndefined();
        });
    });
    describe("Auth tools", () => {
        it("teamup_login should require email and password", () => {
            const tool = getToolByName("teamup_login");
            expect(tool?.inputSchema.required).toContain("email");
            expect(tool?.inputSchema.required).toContain("password");
        });
        it("teamup_get_current_user should require token", () => {
            const tool = getToolByName("teamup_get_current_user");
            expect(tool?.inputSchema.required).toContain("token");
        });
    });
    describe("Venue tools", () => {
        it("teamup_search_venues should have optional location params", () => {
            const tool = getToolByName("teamup_search_venues");
            expect(tool?.inputSchema.properties).toHaveProperty("lat");
            expect(tool?.inputSchema.properties).toHaveProperty("lng");
            expect(tool?.inputSchema.properties).toHaveProperty("distance");
            expect(tool?.inputSchema.properties).toHaveProperty("sport_type");
            // No required fields for search
            expect(tool?.inputSchema.required).toBeUndefined();
        });
        it("teamup_get_venue should require venue_id", () => {
            const tool = getToolByName("teamup_get_venue");
            expect(tool?.inputSchema.required).toContain("venue_id");
        });
        it("teamup_get_court_time_slots should require venue_id and court_id", () => {
            const tool = getToolByName("teamup_get_court_time_slots");
            expect(tool?.inputSchema.required).toContain("venue_id");
            expect(tool?.inputSchema.required).toContain("court_id");
        });
    });
    describe("Event tools", () => {
        it("teamup_list_events should have optional filter params", () => {
            const tool = getToolByName("teamup_list_events");
            expect(tool?.inputSchema.properties).toHaveProperty("status");
            expect(tool?.inputSchema.properties).toHaveProperty("visibility");
            expect(tool?.inputSchema.properties).toHaveProperty("keyword");
            expect(tool?.inputSchema.properties).toHaveProperty("limit");
            expect(tool?.inputSchema.properties).toHaveProperty("offset");
        });
        it("teamup_get_event should require event_id", () => {
            const tool = getToolByName("teamup_get_event");
            expect(tool?.inputSchema.required).toContain("event_id");
        });
        it("teamup_create_event should require token, title, and max_participants", () => {
            const tool = getToolByName("teamup_create_event");
            expect(tool?.inputSchema.required).toContain("token");
            expect(tool?.inputSchema.required).toContain("title");
            expect(tool?.inputSchema.required).toContain("max_participants");
        });
        it("teamup_update_event should require token and event_id", () => {
            const tool = getToolByName("teamup_update_event");
            expect(tool?.inputSchema.required).toContain("token");
            expect(tool?.inputSchema.required).toContain("event_id");
        });
    });
    describe("Join request tools", () => {
        it("teamup_request_to_join should require token and event_id", () => {
            const tool = getToolByName("teamup_request_to_join");
            expect(tool?.inputSchema.required).toContain("token");
            expect(tool?.inputSchema.required).toContain("event_id");
        });
        it("teamup_review_join_request should require token, event_id, request_id, and action", () => {
            const tool = getToolByName("teamup_review_join_request");
            expect(tool?.inputSchema.required).toContain("token");
            expect(tool?.inputSchema.required).toContain("event_id");
            expect(tool?.inputSchema.required).toContain("request_id");
            expect(tool?.inputSchema.required).toContain("action");
        });
    });
    describe("Booking tools", () => {
        it("teamup_list_bookings should require token", () => {
            const tool = getToolByName("teamup_list_bookings");
            expect(tool?.inputSchema.required).toContain("token");
        });
        it("teamup_book_time_slot_for_event should require token, event_id, and time_slot_ids", () => {
            const tool = getToolByName("teamup_book_time_slot_for_event");
            expect(tool?.inputSchema.required).toContain("token");
            expect(tool?.inputSchema.required).toContain("event_id");
            expect(tool?.inputSchema.required).toContain("time_slot_ids");
        });
    });
    describe("Ticket tools", () => {
        it("teamup_create_ticket should require token, date, start_time, duration_minutes, and sport_type", () => {
            const tool = getToolByName("teamup_create_ticket");
            expect(tool?.inputSchema.required).toContain("token");
            expect(tool?.inputSchema.required).toContain("date");
            expect(tool?.inputSchema.required).toContain("start_time");
            expect(tool?.inputSchema.required).toContain("duration_minutes");
            expect(tool?.inputSchema.required).toContain("sport_type");
        });
    });
    describe("Notification tools", () => {
        it("teamup_get_notifications should require token", () => {
            const tool = getToolByName("teamup_get_notifications");
            expect(tool?.inputSchema.required).toContain("token");
        });
        it("teamup_mark_notification_read should require token and notification_id", () => {
            const tool = getToolByName("teamup_mark_notification_read");
            expect(tool?.inputSchema.required).toContain("token");
            expect(tool?.inputSchema.required).toContain("notification_id");
        });
    });
});
//# sourceMappingURL=tools.test.js.map