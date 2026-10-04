import { describe, expect, test } from "bun:test";
import { fetchProjectPreview, isPreviewProject, sanitizeProjectPreview } from "../../src/lib/project-preview";

describe("project previews", () => {
  test("only the two named public projects can be selected", () => {
    expect(isPreviewProject("supervisor")).toBe(true);
    expect(isPreviewProject("constructor")).toBe(true);
    for (const value of ["__proto__", "constructor.prototype", "toString", "https://example.com", "../supervisor"]) {
      expect(isPreviewProject(value)).toBe(false);
    }
  });

  test("preserve the visible header while removing executable and redirecting content", () => {
    const html = sanitizeProjectPreview(`<html><head>
      <base href="https://untrusted.example/"><meta http-equiv="refresh" content="0;url=https://untrusted.example">
      <link rel="stylesheet" href="/styles.css"><link rel="preload" as="script" href="/app.js">
      <link rel="stylesheet" href="https://untrusted.example/styles.css"><script>alert(1)</script>
      </head><body onload="alert(2)"><header data-step="0"><a href="/" aria-label="Supervisor home">Supervisor</a>
      <svg viewBox="0 0 40 40"><path d="M0 0H40V40Z" fill="black"/><script>alert(3)</script></svg>
      <img src="/logo.svg" onerror="alert(4)"><img src="https://untrusted.example/pixel">
      <form action="https://untrusted.example"><input formaction="https://untrusted.example" onfocus="alert(5)"><button onclick="alert(6)">Start</button></form>
      <iframe srcdoc="&lt;script&gt;alert(7)&lt;/script&gt;"></iframe><a href="javascript:alert(8)">Link</a>
      </header></body></html>`, "supervisor");
    expect(html).toContain("Supervisor home");
    expect(html).toContain('data-step="0"');
    expect(html).toContain('viewbox="0 0 40 40"');
    expect(html).toContain('href="https://trysupervisor.com/styles.css"');
    expect(html).toContain('src="https://trysupervisor.com/logo.svg"');
    expect(html).toMatch(/<input\s+disabled(?:\s|>)/);
    expect(html).not.toMatch(/<script|<iframe|onload=|onclick=|onerror=|onfocus=|formaction=|http-equiv=|javascript:|untrusted\.example|app\.js/);
    expect(html.match(/<base\b/g)).toHaveLength(1);
  });

  test("resolve Constructor resources to its actual website origin", () => {
    const html = sanitizeProjectPreview('<html><head><link rel="stylesheet" href="/site.css"></head><body><img src="/mark.svg"></body></html>', "constructor");
    expect(html).toContain('href="https://www.useconstructor.com/site.css"');
    expect(html).toContain('src="https://www.useconstructor.com/mark.svg"');
  });

  test("stop before requesting a redirect to a different host", async () => {
    const urls: string[] = [];
    await expect(fetchProjectPreview("supervisor", async (url) => {
      urls.push(url);
      return new Response(null, { status: 302, headers: { Location: "http://127.0.0.1/private" } });
    })).rejects.toThrow("outside the project website");
    expect(urls).toEqual(["https://trysupervisor.com/"]);
  });

  test("follow a same site redirect and sanitize the fetched document", async () => {
    const urls: string[] = [];
    const html = await fetchProjectPreview("constructor", async (url) => {
      urls.push(url);
      return urls.length === 1
        ? new Response(null, { status: 302, headers: { Location: "/en" } })
        : new Response("<h1>Build software</h1><script>privateCode()</script>", { headers: { "Content-Type": "text/html" } });
    });
    expect(urls).toEqual(["https://www.useconstructor.com/", "https://www.useconstructor.com/en"]);
    expect(html).toContain("<h1>Build software</h1>");
    expect(html).not.toContain("privateCode");
  });

  test("resolve relative resources and the document base after directory redirects", async () => {
    const urls: string[] = [];
    const html = await fetchProjectPreview("supervisor", async (url) => {
      urls.push(url);
      if (urls.length === 1) return new Response(null, { status: 302, headers: { Location: "/landing/" } });
      if (urls.length === 2) return new Response(null, { status: 307, headers: { Location: "en/?plan=pro&theme=light" } });
      return new Response('<html><head><link rel="stylesheet" href="styles/site.css"></head><body><img src="../images/hero.png"><a href="pricing">Pricing</a></body></html>', { headers: { "Content-Type": "text/html" } });
    });
    expect(urls).toEqual(["https://trysupervisor.com/", "https://trysupervisor.com/landing/", "https://trysupervisor.com/landing/en/?plan=pro&theme=light"]);
    expect(html).toContain('<base href="https://trysupervisor.com/landing/en/?plan=pro&amp;theme=light">');
    expect(html).toContain('href="https://trysupervisor.com/landing/en/styles/site.css"');
    expect(html).toContain('src="https://trysupervisor.com/landing/images/hero.png"');
    expect(html).toContain('<a href="pricing">Pricing</a>');
  });

  test("reject an untrusted document base", () => {
    for (const source of ["https://untrusted.example/landing/", "http://trysupervisor.com/", "https://user:password@trysupervisor.com/"]) {
      expect(() => sanitizeProjectPreview("<h1>Preview</h1>", "supervisor", source)).toThrow("outside the project website");
    }
  });

  test("reject unsupported responses and oversized documents", async () => {
    await expect(fetchProjectPreview("supervisor", async () => new Response("failure", { status: 503 }))).rejects.toThrow("HTTP 503");
    await expect(fetchProjectPreview("supervisor", async () => new Response("{}", { headers: { "Content-Type": "application/json" } }))).rejects.toThrow("unsupported content type");
    await expect(fetchProjectPreview("supervisor", async () => new Response("x".repeat(2 * 1024 * 1024 + 1), { headers: { "Content-Type": "text/html" } }))).rejects.toThrow("size limit");
  });
});
