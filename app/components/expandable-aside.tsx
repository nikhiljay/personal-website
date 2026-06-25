"use client";

import type { ReactNode } from "react";

import "./expandable-aside.css";

export function ExpandableAside({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`expandable-aside ${open ? "is-open" : ""}`.trim()}>
      <div className="expandable-aside__measure" aria-hidden={!open}>
        <div className="expandable-aside__content">{children}</div>
      </div>
    </div>
  );
}
