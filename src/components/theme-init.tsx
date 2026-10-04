"use client";

import { useSyncExternalStore } from "react";
import { THEME_INIT_SCRIPT, THEME_STYLE, THEME_STYLE_ID } from "@/lib/theme";

const subscribe = () => () => {};
const clientSnapshot = () => false;
const serverSnapshot = () => true;

export function ThemeInit() {
  const serverRender = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);

  return (
    <>
      <style id={THEME_STYLE_ID}>{THEME_STYLE}</style>
      {/* Execute during HTML parsing, then remove the script after hydration. */}
      {serverRender && <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />}
    </>
  );
}
