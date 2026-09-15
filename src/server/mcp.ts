import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

export const MCP_SERVER_INFO = {
  name: "midwest-roots",
  version: "0.1.0",
} as const;

export function createMcpServer() {
  const mcp = new McpServer(MCP_SERVER_INFO, {
    capabilities: { resources: {}, tools: {} },
    instructions: [
      "Midwest Roots homeowner tree-care capabilities use deterministic engines.",
      "This foundation build intentionally exposes no homeowner capability tools yet.",
      "When Species tools are added, preserve canonical ambiguity, ties, ordinary no-match, and outside-supported-universe outcomes.",
    ].join(" "),
  });

  mcp.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [] }));
  mcp.server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: [] }));
  mcp.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({ resourceTemplates: [] }));
  return mcp;
}
