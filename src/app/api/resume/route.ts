import { getResume, resumeQuerySchema } from "@/lib/resume";
import { resumePath } from "@/lib/site";

const publicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Disposition, Location",
  "X-Content-Type-Options": "nosniff",
};

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const duplicate = Array.from(new Set(params.keys())).find((key) => params.getAll(key).length > 1);
  const result = resumeQuerySchema.safeParse(Object.fromEntries(params));

  if (duplicate || !result.success) {
    return Response.json({
      error: "Invalid query parameters.",
      details: duplicate
        ? [`Parameter ${duplicate} must appear only once.`]
        : result.error?.issues.map((issue) => issue.message),
    }, { status: 400, headers: { ...publicHeaders, "Cache-Control": "no-store" } });
  }

  const { lang, version, format, length } = result.data;
  if (format === "pdf") {
    return new Response(null, {
      status: 307,
      headers: {
        ...publicHeaders,
        "Cache-Control": "public, max-age=3600",
        Location: resumePath(lang, version, "pdf", length),
      },
    });
  }

  return Response.json(getResume(lang, version), {
    headers: {
      ...publicHeaders,
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `attachment; filename="eduardo-lopez-${version}-${lang}.json"`,
    },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...publicHeaders, "Access-Control-Max-Age": "86400" } });
}
