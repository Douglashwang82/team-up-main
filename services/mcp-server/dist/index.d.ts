#!/usr/bin/env node
/**
 * TeamUp MCP Server
 *
 * This MCP server exposes the TeamUp API as tools for AI assistants.
 * It allows Claude and other MCP-compatible AI assistants to:
 * - Search for venues and time slots
 * - Create and manage events (TeamUps)
 * - Handle bookings
 * - Manage join requests
 * - Access user information
 */
export { tools, getToolByName, TOOL_NAMES } from "./tools.js";
export { executeTool } from "./executor.js";
export { apiRequest, buildSearchParams, getApiBaseUrl } from "./api.js";
//# sourceMappingURL=index.d.ts.map