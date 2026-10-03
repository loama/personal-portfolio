import { handleMcpPost, isAllowedMcpOrigin, mcpError, mcpHeaders } from "@/lib/mcp";

export const runtime = "nodejs";
export const POST = handleMcpPost;

export function GET(request: Request) {
  if (!isAllowedMcpOrigin(request)) return mcpError(request, 403, "Origin is not allowed.");
  return mcpError(request, 405, "Use POST for MCP requests. This service does not open event streams.");
}

export function OPTIONS(request: Request) {
  if (!isAllowedMcpOrigin(request)) return mcpError(request, 403, "Origin is not allowed.");
  const headers = mcpHeaders(request);
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}
