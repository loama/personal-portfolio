import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { getResume } from "./resume";
import { LOCALES, PDF_LENGTHS, resumePath, SITE_URL, VERSIONS } from "./site";

export function createResumeServer() {
  const server = new McpServer({ name: "eduardo-lopez-resume", version: "1.0.0" }, {
    instructions: "Read Eduardo López's public résumé in English or Spanish. Choose the founder or employee version. The service has no private account data and does not change data.",
    maxToolInputElements: 16,
  });

  server.registerTool("get_resume", {
    title: "Get Eduardo López's résumé",
    description: "Return the public résumé as structured JSON, including expanded experience details, or a URL for a short or full PDF. Dates absent from the source remain absent.",
    inputSchema: z.strictObject({
      language: z.enum(LOCALES).default("en").describe("Résumé language."),
      version: z.enum(VERSIONS).default("founder").describe("Founder or employee emphasis."),
      format: z.enum(["json", "pdf"]).default("json").describe("Structured JSON or a PDF download URL."),
      length: z.enum(PDF_LENGTHS).default("short").describe("PDF length. Short is one page; full includes expanded experience. JSON always includes all details."),
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, ({ language, version, format, length }) => {
    if (format === "pdf") {
      const result = { url: new URL(resumePath(language, version, "pdf", length), SITE_URL).href, language, version, mimeType: "application/pdf" };
      return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
    }

    const resume = getResume(language, version);
    return { content: [{ type: "text", text: JSON.stringify(resume) }], structuredContent: resume };
  });

  for (const version of VERSIONS) {
    for (const language of LOCALES) {
      server.registerResource(`resume_${version}_${language}`, `resume://${version}/${language}`, {
        title: `Eduardo López résumé, ${version}, ${language === "en" ? "English" : "Spanish"}`,
        description: "Public résumé using JSON Resume fields, with expanded experience in work[].details.",
        mimeType: "application/json",
      }, (uri) => ({
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(getResume(language, version)) }],
      }));
    }
  }

  return server;
}

export function isAllowedMcpOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const allowed = new Set([SITE_URL, new URL(request.url).origin]);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (host) allowed.add(`https://${host}`);
  }
  return allowed.has(origin);
}

export function mcpHeaders(request: Request) {
  const headers = new Headers({
    Allow: "POST, OPTIONS",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID",
    "Access-Control-Expose-Headers": "Mcp-Protocol-Version",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
  });
  const origin = request.headers.get("origin");
  if (origin && isAllowedMcpOrigin(request)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

export function mcpError(request: Request, status: number, message: string) {
  return Response.json({ jsonrpc: "2.0", error: { code: -32000, message }, id: null }, { status, headers: mcpHeaders(request) });
}

export async function handleMcpPost(request: Request) {
  if (!isAllowedMcpOrigin(request)) return mcpError(request, 403, "Origin is not allowed.");

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
    maxRequestBodySize: 16 * 1024,
  });
  const server = createResumeServer();
  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    const headers = mcpHeaders(request);
    response.headers.forEach((value, name) => headers.set(name, value));
    return new Response(response.body, { status: response.status, headers });
  } finally {
    await server.close();
    await transport.close();
  }
}
