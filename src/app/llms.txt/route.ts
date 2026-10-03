import { SITE_URL } from "@/lib/site";

export function GET() {
  const guide = `# Eduardo López

Eduardo López is a founder and full stack engineer. This site publishes his professional background in English and Spanish.

## Résumé data

Read ${SITE_URL}/api/resume for the English founder résumé as JSON. Set lang to en or es, version to founder or employee, and format to json or pdf. PDF requests redirect to a relative path on the current deployment. Unknown parameters, repeated parameters, and unsupported values return 400.

The founder version puts Supervisor and Amiloz first. The employee version puts Nixtla and Amiloz first. Both use the same source facts. Dates absent from the source stay absent. Do not infer a start date for Nixtla, language proficiency levels, or other missing facts.

The response follows JSON Resume fields and adds language, version, lastModified, and sources inside meta. Cite the sources when using career claims.

API schema: ${SITE_URL}/api/openapi
Spanish employee example: ${SITE_URL}/api/resume?lang=es&version=employee&format=json
English founder PDF: ${SITE_URL}/api/resume?lang=en&version=founder&format=pdf

## MCP access

Connect an MCP client with Streamable HTTP to ${SITE_URL}/mcp. Send POST requests with Content-Type application/json and an Accept header containing application/json and text/event-stream. Initialize normally. The server returns JSON responses and keeps no sessions. GET returns 405.

The get_resume tool accepts language en or es, version founder or employee, and format json or pdf. Defaults are en, founder, and json. JSON results contain the résumé in structuredContent and text. PDF results contain the exact public download URL.

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
