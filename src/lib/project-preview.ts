import sanitizeHtml from "sanitize-html";

export const projectPreviewSources = {
  supervisor: "https://trysupervisor.com/",
  constructor: "https://www.useconstructor.com/",
} as const;

export type PreviewProject = keyof typeof projectPreviewSources;
const maximumBytes = 2 * 1024 * 1024;

export function isPreviewProject(value: string): value is PreviewProject {
  return Object.hasOwn(projectPreviewSources, value);
}

function resourceUrl(value: string | undefined, source: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value, source);
    if (url.origin !== new URL(source).origin || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function sanitizeProjectPreview(html: string, project: PreviewProject) {
  const source = projectPreviewSources[project];
  const cleaned = sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "html", "head", "body", "title", "link", "img", "picture", "source", "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "defs", "clippath", "mask", "lineargradient", "radialgradient", "stop", "button", "form", "input", "textarea", "label"],
    allowedAttributes: {
      "*": ["class", "id", "style", "role", "aria-label", "aria-hidden", "data-*", "hidden", "inert"],
      html: ["lang"],
      a: ["href", "title"],
      link: ["rel", "href"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      svg: ["viewbox", "width", "height", "fill", "stroke", "stroke-width", "xmlns"],
      g: ["fill", "stroke", "transform", "clip-path", "mask"],
      path: ["d", "fill", "fill-rule", "clip-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "opacity", "transform"],
      rect: ["x", "y", "width", "height", "rx", "ry", "fill", "stroke", "opacity"],
      circle: ["cx", "cy", "r", "fill", "stroke", "stroke-width", "opacity"],
      ellipse: ["cx", "cy", "rx", "ry", "fill", "stroke"],
      line: ["x1", "y1", "x2", "y2", "stroke", "stroke-width", "stroke-linecap"],
      polyline: ["points", "fill", "stroke", "stroke-width"],
      polygon: ["points", "fill", "stroke", "stroke-width"],
      lineargradient: ["x1", "x2", "y1", "y2", "gradientunits", "gradienttransform"],
      radialgradient: ["cx", "cy", "r", "gradientunits", "gradienttransform"],
      stop: ["offset", "stop-color", "stop-opacity"],
      button: ["type", "disabled"],
      input: ["type", "placeholder", "value", "disabled"],
      textarea: ["placeholder", "disabled", "rows"],
    },
    allowedSchemes: ["https"],
    allowProtocolRelative: false,
    nonTextTags: ["script", "style", "noscript", "iframe", "object", "embed", "template"],
    transformTags: {
      link: (tagName, attributes) => ({ tagName, attribs: { rel: attributes.rel ?? "", href: resourceUrl(attributes.href, source) ?? "" } }),
      img: (tagName, attributes) => ({ tagName, attribs: { ...attributes, src: resourceUrl(attributes.src, source) ?? "", loading: "lazy", decoding: "async" } }),
      input: (tagName, attributes) => ({ tagName, attribs: { ...attributes, disabled: "" } }),
      button: (tagName, attributes) => ({ tagName, attribs: { ...attributes, type: "button", disabled: "" } }),
      textarea: (tagName, attributes) => ({ tagName, attribs: { ...attributes, disabled: "" } }),
    },
    exclusiveFilter: (frame) => (frame.tag === "link" && (frame.attribs.rel !== "stylesheet" || !frame.attribs.href)) || (frame.tag === "img" && !frame.attribs.src),
  });
  const head = `<base href="${source}"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html{color-scheme:light}body{margin:0;overflow:hidden}</style>`;
  return `<!doctype html>${cleaned.includes("<head>") ? cleaned.replace("<head>", `<head>${head}`) : `<html><head>${head}</head><body>${cleaned}</body></html>`}`;
}

type PreviewFetch = (url: string, init: RequestInit & { next: { revalidate: number } }) => Promise<Response>;

export async function fetchProjectPreview(project: PreviewProject, request: PreviewFetch = fetch) {
  const source = projectPreviewSources[project];
  let url: string = source;
  const signal = AbortSignal.timeout(10000);
  for (let redirects = 0; redirects <= 3; redirects++) {
    const response = await request(url, { redirect: "manual", signal, next: { revalidate: 60 } });
    if (response.status >= 300 && response.status < 400) {
      const next = resourceUrl(response.headers.get("location") ?? undefined, url);
      await response.body?.cancel();
      if (!next || new URL(next).origin !== new URL(source).origin) throw new Error("Preview redirect is outside the project website.");
      url = next;
      continue;
    }
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
      await response.body?.cancel();
      throw new Error(`Preview returned HTTP ${response.status} or an unsupported content type.`);
    }
    if (!response.body) throw new Error("Preview response has no body.");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maximumBytes) throw new Error("Preview response exceeds the size limit.");
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    return sanitizeProjectPreview(Buffer.concat(chunks).toString("utf8"), project);
  }
  throw new Error("Preview response has too many redirects.");
}
