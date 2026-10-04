import { fetchProjectPreview, isPreviewProject, projectPreviewSources } from "@/lib/project-preview";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(projectPreviewSources).map((project) => ({ project }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ project: string }> }) {
  const { project } = await params;
  if (!isPreviewProject(project)) return new Response("Unknown project.", { status: 404 });
  try {
    const html = await fetchProjectPreview(project);
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "X-Preview-State": "live" } });
  } catch (error) {
    console.error("Project preview unavailable", { project, reason: error instanceof Error ? error.message : "Unknown failure" });
    return new Response("<!doctype html><html><head><meta name=\"robots\" content=\"noindex\"></head><body></body></html>", { headers: { "Content-Type": "text/html; charset=utf-8", "X-Preview-State": "fallback" } });
  }
}
