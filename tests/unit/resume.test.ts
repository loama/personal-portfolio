import { describe, expect, test } from "bun:test";
import sourceProfile from "../../content/profile.json";
import { GET, OPTIONS } from "../../src/app/api/resume/route";
import { GET as getOpenApi } from "../../src/app/api/openapi/route";
import { GET as getAgentGuide } from "../../src/app/llms.txt/route";
import { getResume, profileSchema } from "../../src/lib/resume";
import { contacts, LOCALES, resumePath, SITE_URL, VERSIONS } from "../../src/lib/site";

describe("résumé source and variants", () => {
  for (const language of LOCALES) {
    for (const version of VERSIONS) {
      test(`${version} ${language} preserves sourced facts and localized content`, () => {
        const resume = getResume(language, version);
        expect(resume.basics.name).toBe(sourceProfile.name);
        expect(resume.basics.summary).toBe(sourceProfile.summary[version][language]);
        expect(resume.basics.email).toBe(contacts.email);
        expect(resume.meta).toEqual({ language, version, lastModified: sourceProfile.updated, sources: sourceProfile.sources });
        expect(resume.work.map(({ name }) => name).slice(0, 4)).toEqual(version === "founder"
          ? ["Supervisor", "Amiloz", "Nixtla", language === "es" ? "Consultoría" : "Independent"]
          : ["Nixtla", "Amiloz", language === "es" ? "Consultoría" : "Independent", "Supervisor"]);
        expect(resume.work).toHaveLength(sourceProfile.work.length);

        for (const source of sourceProfile.work) {
          const name = language === "es" ? (source.nameEs ?? source.name) : source.name;
          const work = resume.work.find((work) => work.name === name);
          expect(work).toMatchObject({ name, position: source.position[language], summary: source.summary[language], highlights: source.highlights[language] });
          expect(work?.startDate).toBe(source.startDate);
          expect(work?.endDate).toBe(source.endDate);
        }
        expect(resume.work.find(({ name }) => name === "Nixtla")).not.toHaveProperty("startDate");
        expect(resume.skills[0].keywords).toEqual(sourceProfile.skills);
        expect(resume.education.map(({ area }) => area)).toEqual(sourceProfile.education.map(({ area }) => area[language]));
        expect(resume.languages).toEqual(language === "en"
          ? [{ language: "English" }, { language: "Spanish" }]
          : [{ language: "Inglés" }, { language: "Español" }]);
        expect(resume.projects.map(({ name }) => name)).toEqual(["Supervisor", "Constructor"]);
        expect(resume.projects[1].url).toBe("https://useconstructor.com");
      });
    }
  }

  test("source validation rejects missing translations and invalid dates", () => {
    expect(profileSchema.safeParse({ ...sourceProfile, summary: { ...sourceProfile.summary, founder: { en: "Only English" } } }).success).toBe(false);
    expect(profileSchema.safeParse({ ...sourceProfile, work: [{ ...sourceProfile.work[0], startDate: "2023-13" }] }).success).toBe(false);
  });

  test("mutating one response cannot change later responses", () => {
    const resume = getResume();
    resume.work[0].highlights.push("Unpublished claim");
    resume.skills[0].keywords.push("Unpublished skill");
    resume.meta.sources.push("https://example.com");
    expect(getResume().work[0].highlights).not.toContain("Unpublished claim");
    expect(getResume().skills[0].keywords).not.toContain("Unpublished skill");
    expect(getResume().meta.sources).not.toContain("https://example.com");
  });
});

describe("public résumé HTTP API", () => {
  test("defaults to a public English founder JSON download", async () => {
    const response = GET(new Request(`${SITE_URL}/api/resume`));
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="eduardo-lopez-founder-en.json"');
    expect(await response.json()).toEqual(getResume());
  });

  for (const language of LOCALES) {
    for (const version of VERSIONS) {
      test(`serves ${version} ${language} JSON and exact PDF URL`, async () => {
        const query = `lang=${language}&version=${version}`;
        const json = GET(new Request(`${SITE_URL}/api/resume?${query}&format=json`));
        expect(await json.json()).toEqual(getResume(language, version));
        const pdf = GET(new Request(`${SITE_URL}/api/resume?${query}&format=pdf`));
        expect(pdf.status).toBe(307);
        expect(pdf.headers.get("location")).toBe(resumePath(language, version, "pdf"));
      });
    }
  }

  test("PDF redirects stay on the deployment that received the request", () => {
    for (const origin of ["http://localhost:3000", "https://portfolio-preview.example.vercel.app", SITE_URL]) {
      const requestUrl = `${origin}/api/resume?lang=es&version=employee&format=pdf`;
      const response = GET(new Request(requestUrl));
      const location = response.headers.get("location");
      expect(location).toBe(resumePath("es", "employee", "pdf"));
      expect(new URL(location!, requestUrl).origin).toBe(origin);
    }
  });

  for (const query of ["lang=fr", "lang=EN", "lang=", "version=manager", "format=html", "lang=en&lang=es", "lang=en&lang=en", "version=founder&version=employee", "format=json&format=pdf", "unexpected=value"]) {
    test(`rejects invalid query ${query}`, async () => {
      const response = GET(new Request(`${SITE_URL}/api/resume?${query}`));
      expect(response.status).toBe(400);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const body = await response.json();
      expect(body.error).toBe("Invalid query parameters.");
      expect(body.details.length).toBeGreaterThan(0);
    });
  }

  test("supports public preflight", () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-methods")).toBe("GET, HEAD, OPTIONS");
  });

  test("publishes the API contract and agent instructions", async () => {
    const schema = await getOpenApi().json();
    expect(schema.openapi).toBe("3.1.0");
    expect(Object.keys(schema.paths["/api/resume"].get.responses)).toEqual(["200", "307", "400"]);
    expect(schema.components.schemas.Resume.properties.work.items.required).not.toContain("startDate");
    expect(schema.paths["/api/resume"].get.responses["307"].headers.Location.schema.format).toBe("uri-reference");
    const guide = await getAgentGuide().text();
    expect(guide).toContain(`${SITE_URL}/mcp`);
    expect(guide).toContain("Do not infer a start date for Nixtla");
    for (const language of LOCALES) for (const version of VERSIONS) expect(guide).toContain(`resume://${version}/${language}`);
  });
});
