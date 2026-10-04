"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ProjectPreview({ source, title, children }: { source: string; title: string; children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={container} aria-hidden="true" className="relative aspect-[16/11] overflow-hidden rounded-[1.55rem] bg-white">
    {children}
    <iframe
      src={visible ? source : undefined}
      title={title}
      loading="lazy"
      sandbox=""
      referrerPolicy="no-referrer"
      tabIndex={-1}
      className="pointer-events-none absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[.4] border-0"
    />
  </div>;
}
