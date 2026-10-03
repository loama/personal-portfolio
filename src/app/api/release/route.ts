export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ commit: process.env.RELEASE_COMMIT ?? "local" }, { headers: { "Cache-Control": "no-store" } });
}
