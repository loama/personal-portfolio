import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { isLocale, LOCALES, SITE_URL } from "@/lib/site";
import "../globals.css";

const general = localFont({
  src: "../../../public/fonts/GeneralSans-Variable.ttf",
  variable: "--font-general",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Eduardo López | Founder & software engineer", template: "%s | Eduardo López" },
  description: "Building Supervisor and Constructor. Cofounder of Amiloz, Y Combinator W22. Software, product, and the work of building a company.",
  openGraph: { type: "website", siteName: "Eduardo López", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", creator: "@eduardo_lop__", images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LocaleLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={general.variable}>
      <body className="bg-paper font-sans text-ink antialiased">
        <a href="#main" className="skip-link">{lang === "es" ? "Saltar al contenido" : "Skip to content"}</a>
        {children}
      </body>
    </html>
  );
}
