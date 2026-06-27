"use client";

import { useEffect, useState } from "react";

export type PreferredColorScheme = "light" | "dark";

export function getPreferredColorScheme(): PreferredColorScheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function usePreferredColorScheme(): PreferredColorScheme {
  const [scheme, setScheme] = useState<PreferredColorScheme>("light");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      setScheme(media.matches ? "dark" : "light");
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return scheme;
}
