import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { POST } from "../../src/app/api/events/route";

const environment = { ...process.env };
const visitor = "ad15e5df-e074-4c88-b53a-a6ab346c1ef8";
const event = { name: "download_pdf", path: "/es/resume/founder", visitor, consent: true };
let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, "fetch">> | undefined;

afterEach(() => {
  fetchSpy?.mockRestore();
  fetchSpy = undefined;
  for (const key of ["ANALYTICS_ENABLED", "PLAUSIBLE_DOMAIN", "POSTHOG_PROJECT_KEY", "POSTHOG_HOST"]) {
    if (environment[key] === undefined) delete process.env[key];
    else process.env[key] = environment[key];
  }
});

function request(payload: unknown = event, headers: Record<string, string> = {}) {
  return new Request("https://eduardo-lopez.com/api/events", {
    method: "POST", headers: { origin: "https://eduardo-lopez.com", "content-type": "text/plain;charset=UTF-8", ...headers },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

describe("consented analytics ingestion", () => {
  test("accepts the six story routes without allowing private URL data", async () => {
    process.env.ANALYTICS_ENABLED = "false";
    for (const locale of ["en", "es"]) {
      for (const suffix of ["", "/resume/founder", "/resume/employee"]) {
        const path = `/${locale}/v2${suffix}`;
        expect((await POST(request({ ...event, path }))).status).toBe(204);
        for (const extra of ["?email=private@example.com", "#private", "/extra"]) {
          expect((await POST(request({ ...event, path: `${path}${extra}` }))).status).toBe(400);
        }
      }
    }
    for (const path of ["/fr/v2", "/en/v2/resume", "/en/v2/resume/admin", "/en/v20"]) {
      expect((await POST(request({ ...event, path }))).status).toBe(400);
    }
  });

  test("rejects foreign origins, invalid data and unconsented events", async () => {
    expect((await POST(request(event, { origin: "https://other.example" }))).status).toBe(403);
    expect((await POST(request(event, { "content-type": "text/html" }))).status).toBe(415);
    expect((await POST(request("{"))).status).toBe(400);
    expect((await POST(request({ ...event, consent: false }))).status).toBe(400);
    expect((await POST(request({ ...event, path: "/en?email=private@example.com" }))).status).toBe(400);
    expect((await POST(request({ ...event, email: "private@example.com" }))).status).toBe(400);
    expect((await POST(request({ ...event, name: "arbitrary_event" }))).status).toBe(400);
  });

  test("privacy signals and disabled analytics make no external request", async () => {
    process.env.ANALYTICS_ENABLED = "true";
    fetchSpy = spyOn(globalThis, "fetch");
    for (const header of ["sec-gpc", "dnt"]) expect((await POST(request(event, { [header]: "1" }))).status).toBe(204);
    process.env.ANALYTICS_ENABLED = "false";
    expect((await POST(request())).status).toBe(204);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("cancels oversized streamed bodies without buffering the rest", async () => {
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) { controller.enqueue(new Uint8Array(600)); },
      cancel() { cancelled = true; },
    });
    const streamed = new Request("https://eduardo-lopez.com/api/events", {
      method: "POST", headers: { origin: "https://eduardo-lopez.com", "content-type": "application/json" }, body: stream,
    });
    expect((await POST(streamed)).status).toBe(413);
    expect(cancelled).toBe(true);
    expect((await POST(request(event, { "content-length": "1025" }))).status).toBe(413);
  });

  test("forwards the allowed event and disclosed visitor data to dedicated hosts", async () => {
    process.env.ANALYTICS_ENABLED = "true";
    process.env.PLAUSIBLE_DOMAIN = "eduardo-lopez.com";
    process.env.POSTHOG_PROJECT_KEY = "test_project_key";
    process.env.POSTHOG_HOST = "https://eu.i.posthog.com";
    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const response = await POST(request(event, { "user-agent": "Test browser", "x-forwarded-for": "192.0.2.1, 192.0.2.2" }));
    expect(response.status).toBe(204);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const [plausible, posthog] = fetchSpy.mock.calls;
    expect(plausible[0]).toBe("https://plausible.io/api/event");
    expect(plausible[1]?.headers).toMatchObject({ "User-Agent": "Test browser", "X-Forwarded-For": "192.0.2.1" });
    expect(JSON.parse(String(plausible[1]?.body))).toEqual({ name: "download_pdf", url: "https://eduardo-lopez.com/es/resume/founder", domain: "eduardo-lopez.com" });
    expect(posthog[0]).toBe("https://eu.i.posthog.com/i/v0/e/");
    expect(JSON.parse(String(posthog[1]?.body))).toEqual({ api_key: "test_project_key", event: "download_pdf", distinct_id: visitor, properties: { $current_url: "https://eduardo-lopez.com/es/resume/founder", $pathname: "/es/resume/founder", $process_person_profile: false, $ip: null } });
  });

  test("reports provider failures and rejects configurable arbitrary hosts", async () => {
    process.env.ANALYTICS_ENABLED = "true";
    process.env.PLAUSIBLE_DOMAIN = "eduardo-lopez.com";
    delete process.env.POSTHOG_PROJECT_KEY;
    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 503 }));
    expect((await POST(request())).status).toBe(502);
    fetchSpy.mockRejectedValue(new Error("network failure"));
    expect((await POST(request())).status).toBe(502);
    fetchSpy.mockClear();
    process.env.PLAUSIBLE_DOMAIN = "other.example";
    process.env.POSTHOG_PROJECT_KEY = "test_project_key";
    process.env.POSTHOG_HOST = "https://other.example";
    expect((await POST(request())).status).toBe(204);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
