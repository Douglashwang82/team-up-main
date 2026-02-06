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
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { tools } from "./tools.js";
import { executeTool } from "./executor.js";
// Re-export for testing
export { tools, getToolByName, TOOL_NAMES } from "./tools.js";
export { executeTool } from "./executor.js";
export { apiRequest, buildSearchParams, getApiBaseUrl } from "./api.js";
/**
 * Create and run the MCP server
 */
async function main() {
    const server = new Server({
        name: "teamup-mcp-server",
        version: "1.0.0",
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Handle list tools request
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools };
    });
    // Handle tool execution
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            const result = await executeTool(name, args || {});
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // Connect via stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("TeamUp MCP Server running on stdio");
}
// Only run main if this is the entry point
const isMain = process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("index.ts");
if (isMain) {
    main().catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map