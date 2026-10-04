import { afterEach, describe, expect, test } from "bun:test";
import { waitForRelease } from "../../scripts/check-production";

const commit = "a".repeat(40);
const servers: ReturnType<typeof Bun.serve>[] = [];
afterEach(() => { for (const server of servers.splice(0)) server.stop(true); });

function serve(fetch: () => Response | Promise<Response>) {
  const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch });
  servers.push(server);
  return new URL("/api/release", server.url).href;
}

describe("production release propagation", () => {
  test("waits through an unavailable route and an older release", async () => {
    let requests = 0;
    const url = serve(() => {
      requests++;
      if (requests === 1) return new Response(null, { status: 404 });
      return Response.json({ commit: requests === 2 ? "b".repeat(40) : commit });
    });
    await waitForRelease({ url, commit, intervalMs: 1, timeoutMs: 1000 });
    expect(requests).toBe(3);
  });

  test("requires a matching commit after an invalid success response", async () => {
    let requests = 0;
    const url = serve(() => ++requests === 1 ? new Response("Not JSON") : Response.json({ commit }));
    await waitForRelease({ url, commit, intervalMs: 1, timeoutMs: 1000 });
    expect(requests).toBe(2);
  });

  test("fails when a different release remains active", async () => {
    const url = serve(() => Response.json({ commit: "b".repeat(40) }));
    await expect(waitForRelease({ url, commit, intervalMs: 10, timeoutMs: 1000 })).rejects.toThrow("expected commit");
  });

  test("fails with the last HTTP status when the route never appears", async () => {
    const url = serve(() => new Response(null, { status: 404 }));
    await expect(waitForRelease({ url, commit, intervalMs: 10, timeoutMs: 1000 })).rejects.toThrow("HTTP 404");
  });

  test("preserves the last HTTP status when the final request times out", async () => {
    let requests = 0;
    const url = serve(async () => {
      if (++requests === 1) return new Response(null, { status: 404 });
      await Bun.sleep(250);
      return Response.json({ commit });
    });
    await expect(waitForRelease({ url, commit, intervalMs: 1, timeoutMs: 100 })).rejects.toThrow("HTTP 404. The request failed");
    expect(requests).toBe(2);
  });
});
