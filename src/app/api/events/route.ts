import { analyticsEventSchema } from "@/lib/analytics-schema";
import { SITE_URL } from "@/lib/site";

async function readEventBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return new Response(null, { status: 403 });
  if (request.headers.get("sec-gpc") === "1" || request.headers.get("dnt") === "1") return new Response(null, { status: 204 });
  if (!["application/json", "text/plain"].some((type) => request.headers.get("content-type")?.startsWith(type))) return new Response(null, { status: 415 });
  if (Number(request.headers.get("content-length")) > 1024) return new Response(null, { status: 413 });
  let text: string | null;
  try { text = await readEventBody(request); }
  catch { return new Response(null, { status: 400 }); }
  if (text === null) return new Response(null, { status: 413 });
  let payload: unknown;
  try { payload = JSON.parse(text); } catch { return new Response(null, { status: 400 }); }
  const result = analyticsEventSchema.safeParse(payload);
  if (!result.success) return new Response(null, { status: 400 });
  if (process.env.ANALYTICS_ENABLED !== "true") return new Response(null, { status: 204 });
  const { name, path, visitor } = result.data;
  const tasks: Promise<Response>[] = [];
  const signal = AbortSignal.timeout(3500);
  if (process.env.PLAUSIBLE_DOMAIN === "eduardo-lopez.com") {
    const headers: Record<string, string> = { "Content-Type": "application/json", "User-Agent": request.headers.get("user-agent") ?? "" };
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) headers["X-Forwarded-For"] = ip;
    tasks.push(fetch("https://plausible.io/api/event", { method: "POST", headers, body: JSON.stringify({ name, url: `${SITE_URL}${path}`, domain: process.env.PLAUSIBLE_DOMAIN }), signal }));
  }
  const posthogHost = process.env.POSTHOG_HOST;
  if (process.env.POSTHOG_PROJECT_KEY && ["https://eu.i.posthog.com", "https://us.i.posthog.com"].includes(posthogHost ?? "")) {
    tasks.push(fetch(`${posthogHost}/i/v0/e/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: process.env.POSTHOG_PROJECT_KEY, event: name === "pageview" ? "$pageview" : name, distinct_id: visitor, properties: { $current_url: `${SITE_URL}${path}`, $pathname: path, $process_person_profile: false, $ip: null } }), signal }));
  }
  const responses = await Promise.allSettled(tasks);
  if (responses.some((response) => response.status === "rejected" || !response.value.ok)) return new Response(null, { status: 502 });
  return new Response(null, { status: 204 });
}
