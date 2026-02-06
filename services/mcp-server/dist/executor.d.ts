/**
 * Tool Executor for TeamUp MCP Server
 */
export type ToolArgs = Record<string, unknown>;
/**
 * Execute a tool by name with the given arguments
 */
export declare function executeTool(name: string, args: ToolArgs): Promise<unknown>;
//# sourceMappingURL=executor.d.ts.map