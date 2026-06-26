"use client";

import dynamic from "next/dynamic";

export const LazyKaviAskAi = dynamic(
  () => import("./kavi-ask-ai").then((mod) => mod.KaviAskAi),
  { ssr: false },
);
