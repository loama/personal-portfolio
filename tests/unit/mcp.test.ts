import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { GET, OPTIONS, POST } from "../../src/app/mcp/route";
import { getResume } from "../../src/lib/resume";
import { LOCALES, resumePath, SITE_URL, VERSIONS } from "../../src/lib/site";

const protocolHeaders = {
  "content-type": "application/json",
  accept: "application/json, text/event-stream",
  "mcp-protocol-version": "2025-11-25",
};

function rpc(method: string, params?: Record<string, unknown>, headers: Record<string, string> = {}) {
  return POST(new Request(`${SITE_URL}/mcp`, {
    method: "POST", headers: { ...protocolHeaders, ...headers },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, ...(params ? { params } : {}) }),
  }));
}

describe("MCP client compatibility", () => {
  test("official client initializes, calls the tool, and reads all resources over HTTP", async () => {
    const httpServer = Bun.serve({
      hostname: "127.0.0.1", port: 0,
      fetch: (request) => request.method === "POST" ? POST(request) : GET(request),
    });
    const transport = new StreamableHTTPClientTransport(new URL("/mcp", httpServer.url));
    const client = new Client({ name: "resume-contract-test", version: "1.0.0" });

    try {
      await client.connect(transport);
      expect(transport.sessionId).toBeUndefined();
      expect(client.getServerCapabilities()?.tools).toBeDefined();
      expect(client.getServerCapabilities()?.resources).toBeDefined();

      const { tools } = await client.listTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe("get_resume");
      expect(tools[0].annotations?.readOnlyHint).toBe(true);
      expect(tools[0].annotations?.destructiveHint).toBe(false);
      expect((tools[0].inputSchema.properties?.language as { enum: string[] }).enum).toEqual(["en", "es"]);

      const { resources } = await client.listResources();
      expect(resources).toHaveLength(4);
      for (const language of LOCALES) {
        for (const version of VERSIONS) {
          const result = await client.callTool({ name: "get_resume", arguments: { language, version, format: "json" } });
          expect(result.isError).not.toBe(true);
          expect(result.structuredContent).toEqual(getResume(language, version));

          const uri = `resume://${version}/${language}`;
          expect(resources.map((resource) => resource.uri)).toContain(uri);
          const resource = await client.readResource({ uri });
          expect(resource.contents[0].mimeType).toBe("application/json");
          const content = resource.contents[0];
          expect("text" in content).toBe(true);
          if (!("text" in content)) throw new Error("Expected a JSON text resource.");
          expect(JSON.parse(content.text)).toEqual(getResume(language, version));

          const pdf = await client.callTool({ name: "get_resume", arguments: { language, version, format: "pdf" } });
          expect(pdf.structuredContent).toEqual({ url: `${SITE_URL}${resumePath(language, version, "pdf")}`, language, version, mimeType: "application/pdf" });
        }
      }
      const defaultResume = await client.callTool({ name: "get_resume", arguments: {} });
      expect(defaultResume.structuredContent).toEqual(getResume());
    } finally {
      await client.close();
      await httpServer.stop(true);
    }
  });
});

describe("MCP protocol errors", () => {
  test("invalid tool arguments return a meaningful tool error", async () => {
    for (const argumentsValue of [{ language: "fr" }, { version: "manager" }, { format: "html" }, { private: true }]) {
      const response = await rpc("tools/call", { name: "get_resume", arguments: argumentsValue });
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.result.isError).toBe(true);
      expect(body.result.content[0].text).toContain("Invalid arguments for tool get_resume");
      expect(body.result.structuredContent).toBeUndefined();
    }
  });

  test("unknown tools and resources do not expose résumé data", async () => {
    const tool = await (await rpc("tools/call", { name: "delete_resume", arguments: {} })).json();
    expect(tool.result.isError).toBe(true);
    expect(tool.result.content[0].text).toContain("not found");
    const resource = await (await rpc("resources/read", { uri: "file:///etc/passwd" })).json();
    expect(resource.error).toBeDefined();
    expect(resource.result).toBeUndefined();
  });

  test("malformed JSON and invalid protocol messages return SDK errors", async () => {
    for (const body of ["{", '{"hello":"world"}']) {
      const response = await POST(new Request(`${SITE_URL}/mcp`, { method: "POST", headers: protocolHeaders, body }));
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.jsonrpc).toBe("2.0");
      expect(result.error.code).toBe(-32700);
    }
  });

  test("the SDK limits request bodies to 16 KiB", async () => {
    const response = await POST(new Request(`${SITE_URL}/mcp`, {
      method: "POST", headers: protocolHeaders,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", padding: "x".repeat(16 * 1024) }),
    }));
    expect(response.status).toBe(413);
    expect((await response.json()).error.message).toContain("16384");
  });

  test("unsupported media, Accept, and protocol versions fail clearly", async () => {
    expect((await rpc("tools/list", undefined, { "content-type": "text/plain" })).status).toBe(415);
    expect((await rpc("tools/list", undefined, { accept: "application/json" })).status).toBe(406);
    expect((await rpc("tools/list", undefined, { "mcp-protocol-version": "1900-01-01" })).status).toBe(400);
  });

  test("unknown methods produce a protocol method error", async () => {
    const body = await (await rpc("private/read")).json();
    expect(body.error.code).toBe(-32601);
    expect(body.id).toBe(1);
  });

  test("initialization returns no session and notifications return 202", async () => {
    const response = await rpc("initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } });
    expect(response.status).toBe(200);
    expect(response.headers.get("mcp-session-id")).toBeNull();
    expect((await response.json()).result.protocolVersion).toBe("2025-11-25");
    const notification = await POST(new Request(`${SITE_URL}/mcp`, {
      method: "POST", headers: protocolHeaders, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
    }));
    expect(notification.status).toBe(202);
    expect(await notification.text()).toBe("");
  });
});

describe("MCP browser origins and methods", () => {
  test("allows agents without Origin and browsers on the site origin", async () => {
    expect((await rpc("tools/list")).status).toBe(200);
    const response = await rpc("tools/list", undefined, { origin: SITE_URL });
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(SITE_URL);
  });

  test("allows a deployment preview's own origin", async () => {
    const origin = "https://portfolio-preview.example.vercel.app";
    const response = await POST(new Request(`${origin}/mcp`, {
      method: "POST", headers: { ...protocolHeaders, origin },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(origin);
  });

  test("rejects other browser origins and null origins", async () => {
    for (const origin of ["https://unrelated.example", "null", `${SITE_URL}.unrelated.example`]) {
      const response = await rpc("tools/list", undefined, { origin });
      expect(response.status).toBe(403);
      expect(response.headers.get("access-control-allow-origin")).toBeNull();
      expect((await response.json()).error.message).toBe("Origin is not allowed.");
    }
  });

  test("preflight mirrors allowed origins and GET advertises POST", () => {
    const request = new Request(`${SITE_URL}/mcp`, { headers: { origin: SITE_URL } });
    const preflight = OPTIONS(request);
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-headers")).toContain("Mcp-Protocol-Version");
    expect(preflight.headers.get("access-control-allow-origin")).toBe(SITE_URL);
    expect(OPTIONS(new Request(`${SITE_URL}/mcp`, { headers: { origin: "https://unrelated.example" } })).status).toBe(403);
    expect(GET(new Request(`${SITE_URL}/mcp`, { headers: { origin: "https://unrelated.example" } })).status).toBe(403);
    const get = GET(request);
    expect(get.status).toBe(405);
    expect(get.headers.get("allow")).toBe("POST, OPTIONS");
  });
});
