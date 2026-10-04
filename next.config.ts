import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  env: { RELEASE_COMMIT: process.env.RELEASE_COMMIT ?? "local" },
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      { source: "/", destination: "/en/resume/founder", permanent: false },
      { source: "/about", destination: "/en/resume/founder", permanent: true },
      { source: "/projects/:path*", destination: "/en/resume/founder#work", permanent: true },
      { source: "/projects2", destination: "/en/resume/founder#work", permanent: true },
      { source: "/speaking", destination: "/en/resume/founder#contact", permanent: true },
      { source: "/uses", destination: "/en/resume/employee", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/resume/:path*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] }, {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'` },
      ],
    }, {
      source: "/api/project-preview/:project",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Robots-Tag", value: "noindex" },
        { key: "Content-Security-Policy", value: "default-src 'none'; script-src 'none'; style-src 'unsafe-inline' https://trysupervisor.com https://www.useconstructor.com; img-src https://trysupervisor.com https://www.useconstructor.com data:; font-src https://trysupervisor.com https://www.useconstructor.com; frame-ancestors 'self'; base-uri https://trysupervisor.com https://www.useconstructor.com; form-action 'none'; object-src 'none'; sandbox" },
      ],
    }];
  },
};
export default nextConfig;
