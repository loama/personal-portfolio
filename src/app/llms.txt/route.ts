import { SITE_URL } from "@/lib/site";

export function GET() {
  const guide = `# Eduardo López

Eduardo López is a founder and full stack AI engineer. This site publishes his professional background in English and Spanish.

## Résumé data

Read the [English founder résumé](${SITE_URL}/api/resume) as JSON. Set lang to en or es, version to founder or employee, and format to json or pdf. For PDFs, length=short returns one page and length=full adds expanded experience. The default PDF length is short. PDF requests redirect to a relative path on the current deployment. Unknown parameters, repeated parameters, and unsupported values return 400.

Both versions put Supervisor first. The founder version then emphasizes amiloz; the employee version emphasizes Nixtla. Both use the same source facts. Dates absent from the source stay absent. Do not infer a start date for Nixtla, language proficiency levels, or other missing facts. Nixtla remains a current role. The stated tenure of a little over three years is Eduardo's account as of October 2026.

The response uses JSON Resume fields and adds language, version, lastModified, and sources inside meta. Every work entry includes details, an array of sections with a title and paragraphs. JSON always includes these sections, regardless of the PDF length parameter. The website initially collapses this material. Cite the sources when using career claims. Eduardo built the first API serving TimeGPT; this does not claim that he developed the forecasting model. The amiloz departure describes a personal founder exit, not an acquisition of the company.

1. [OpenAPI schema](${SITE_URL}/api/openapi): Query parameters, responses, and résumé fields.
2. [Spanish employee JSON](${SITE_URL}/api/resume?lang=es&version=employee&format=json): The employment and consulting version in Spanish.
3. [English founder PDF](${SITE_URL}/api/resume?lang=en&version=founder&format=pdf): A printable résumé.
4. [Web résumé and downloads](${SITE_URL}/en/resume/founder): Switch language and audience or download either format.
5. [Detailed English founder PDF](${SITE_URL}/api/resume?lang=en&version=founder&format=pdf&length=full): The one page résumé followed by expanded experience.

## MCP access

Connect an MCP client with Streamable HTTP to the [MCP endpoint](${SITE_URL}/mcp). Send POST requests with Content-Type application/json and an Accept header containing application/json and text/event-stream. Initialize normally. The server returns JSON responses and keeps no sessions. GET returns 405.

The get_resume tool accepts language en or es, version founder or employee, format json or pdf, and length short or full. Defaults are en, founder, json, and short. Length selects the PDF version. JSON results always contain all experience details in structuredContent and text. PDF results contain the exact public download URL.

Four resources expose the same JSON documents:

resume://founder/en
resume://founder/es
resume://employee/en
resume://employee/es

No authentication is needed. All operations only read public information. Requests are limited to 16 KiB. Browser calls must use an allowed site origin. Agents can omit Origin. Use the résumé API for public JSON access from other browser origins.
`;

  return new Response(guide, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" },
  });
}
