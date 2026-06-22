"use client";

import "./glow-name.css";

export function GlowName({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="glow-name shrink-0 whitespace-nowrap font-display text-base font-medium">
      {children}
    </h1>
  );
}
