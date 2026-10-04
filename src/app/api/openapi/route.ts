import { SITE_URL } from "@/lib/site";

const string = { type: "string" };
const stringArray = { type: "array", items: string };
const date = { type: "string", pattern: "^[0-9]{4}(-[0-9]{2})?$", description: "Year or year and month. Unknown dates are omitted." };

const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Eduardo López public résumé API",
    version: "1.0.0",
    description: "Read the English or Spanish résumé with founder or employee emphasis. No authentication is required.",
  },
  servers: [{ url: SITE_URL }],
  paths: {
    "/api/resume": {
      get: {
        operationId: "getResume",
        summary: "Get a public résumé",
        description: "Returns JSON Resume fields with expanded experience in work[].details, or redirects to a short or full PDF. Unknown parameters, invalid values, and repeated parameters return 400. Parameters are case sensitive.",
        parameters: [
          { name: "lang", in: "query", description: "Résumé language.", schema: { type: "string", enum: ["en", "es"], default: "en" } },
          { name: "version", in: "query", description: "Experience emphasis and ordering.", schema: { type: "string", enum: ["founder", "employee"], default: "founder" } },
          { name: "format", in: "query", description: "Download format.", schema: { type: "string", enum: ["json", "pdf"], default: "json" } },
          { name: "length", in: "query", description: "PDF length. Short is one page; full adds expanded experience. JSON always contains all details regardless of this parameter.", schema: { type: "string", enum: ["short", "full"], default: "short" } },
        ],
        responses: {
          "200": {
            description: "Public résumé JSON download.",
            headers: { "Content-Disposition": { description: "Attachment filename for the selected version and language.", schema: string } },
            content: { "application/json": { schema: { $ref: "#/components/schemas/Resume" } } },
          },
          "307": {
            description: "Redirect to the selected public PDF on the current deployment.",
            headers: { Location: { description: "Relative PDF download path. Resolve it against the request URL.", schema: { type: "string", format: "uri-reference" } } },
          },
          "400": {
            description: "A query parameter is unknown, repeated, empty, or has an unsupported value.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Resume: {
        type: "object",
        required: ["basics", "work", "education", "skills", "languages", "projects", "meta"],
        properties: {
          basics: {
            type: "object",
            required: ["name", "label", "email", "phone", "url", "summary", "profiles"],
            properties: {
              name: string, label: string, email: { type: "string", format: "email" }, phone: string,
              url: { type: "string", format: "uri" }, summary: string,
              profiles: {
                type: "array", items: {
                  type: "object", required: ["network", "username", "url"],
                  properties: { network: string, username: string, url: { type: "string", format: "uri" } },
                },
              },
            },
          },
          work: {
            type: "array", items: {
              type: "object", required: ["name", "position", "summary", "highlights"],
              properties: {
                name: string, position: string, url: { type: "string", format: "uri" },
                startDate: date, endDate: date, summary: string, highlights: stringArray,
                details: {
                  type: "array", description: "Expanded experience, grouped by subject or consulting project. Empty when no additional detail is recorded.",
                  items: { type: "object", required: ["title", "paragraphs"], properties: { title: string, paragraphs: { ...stringArray, minItems: 1 } } },
                },
              },
            },
          },
          education: {
            type: "array", items: {
              type: "object", required: ["institution", "area", "startDate"],
              properties: { institution: string, area: string, startDate: date },
            },
          },
          skills: {
            type: "array", items: {
              type: "object", required: ["name", "keywords"], properties: { name: string, keywords: stringArray },
            },
          },
          languages: {
            type: "array", description: "Spoken languages. Proficiency levels are omitted when not sourced.",
            items: { type: "object", required: ["language"], properties: { language: string, fluency: string } },
          },
          projects: {
            type: "array", items: {
              type: "object", required: ["name", "description", "highlights"],
              properties: { name: string, description: string, highlights: stringArray, url: { type: "string", format: "uri" } },
            },
          },
          meta: {
            type: "object", required: ["language", "version", "lastModified", "sources"],
            properties: {
              language: { type: "string", enum: ["en", "es"] },
              version: { type: "string", enum: ["founder", "employee"] },
              lastModified: { type: "string", format: "date" },
              sources: { type: "array", items: { type: "string", format: "uri" } },
            },
          },
        },
      },
      Error: { type: "object", required: ["error", "details"], properties: { error: string, details: stringArray } },
    },
  },
};

export function GET() {
  return Response.json(openApiDocument, {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" },
  });
}
