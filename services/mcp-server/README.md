# TeamUp MCP Server

This MCP (Model Context Protocol) server allows AI assistants like Claude to interact with the TeamUp API directly.

## What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open standard that enables AI assistants to interact with external tools and services. This server exposes the TeamUp API as MCP tools, allowing Claude to:

- Search for sports venues and available time slots
- Create and manage TeamUp events
- Handle join requests
- Manage bookings
- Access user information and notifications

## Setup

### 1. Install Dependencies

```bash
cd services/mcp-server
pnpm install
```

### 2. Build the Server

```bash
pnpm build
```

### 3. Configure Claude Code

The project includes a `.mcp.json` configuration file at the root. Claude Code will automatically detect and use this configuration.

For other MCP clients, add this to your MCP configuration:

```json
{
  "mcpServers": {
    "teamup": {
      "command": "node",
      "args": ["/path/to/team-up-main/services/mcp-server/dist/index.js"],
      "env": {
        "TEAMUP_API_URL": "http://localhost:8000"
      }
    }
  }
}
```

### 4. Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEAMUP_API_URL` | Base URL of the TeamUp API | `http://localhost:8000` |
| `TEAMUP_AUTH_TOKEN` | Optional default auth token | (none) |

## Available Tools

### Authentication

| Tool | Description |
|------|-------------|
| `teamup_login` | Login and get an auth token |
| `teamup_get_current_user` | Get current user info |

### Venues

| Tool | Description |
|------|-------------|
| `teamup_search_venues` | Search venues by location, sport, date |
| `teamup_get_venue` | Get venue details |
| `teamup_get_court_time_slots` | Get available time slots for a court |

### Events (TeamUps)

| Tool | Description |
|------|-------------|
| `teamup_list_events` | List/search events |
| `teamup_get_event` | Get event details |
| `teamup_create_event` | Create a new event |
| `teamup_update_event` | Update an event |
| `teamup_get_my_created_events` | Get events you created |
| `teamup_get_my_joined_events` | Get events you joined |

### Join Requests

| Tool | Description |
|------|-------------|
| `teamup_request_to_join` | Request to join an event |
| `teamup_get_pending_requests` | Get pending join requests |
| `teamup_review_join_request` | Approve/reject a request |

### Bookings

| Tool | Description |
|------|-------------|
| `teamup_list_bookings` | List your bookings |
| `teamup_get_booking` | Get booking details |
| `teamup_book_time_slot_for_event` | Book time slots for an event |

### Tickets (Matching)

| Tool | Description |
|------|-------------|
| `teamup_list_tickets` | List your matching tickets |
| `teamup_create_ticket` | Create a matching ticket |

### Notifications

| Tool | Description |
|------|-------------|
| `teamup_get_notifications` | Get your notifications |
| `teamup_mark_notification_read` | Mark notification as read |

## Usage Example

Once configured, you can ask Claude things like:

- "Search for basketball courts near Taipei (25.0330, 121.5654)"
- "Show me open TeamUp events for tennis"
- "Login as alice@example.com with password123 and show my events"
- "Create a new basketball event called 'Weekend Basketball' for 10 players"

## Development

```bash
# Run in development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

## Architecture

```
services/mcp-server/
├── src/
│   └── index.ts      # Main MCP server with all tool definitions
├── package.json
├── tsconfig.json
└── README.md
```

The server uses the official `@modelcontextprotocol/sdk` package and communicates via stdio transport, which is the standard for MCP servers.
