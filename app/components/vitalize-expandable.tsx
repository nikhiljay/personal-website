"use client";

import { useState } from "react";

import { ExpandableAside } from "./expandable-aside";
import { ExternalLink } from "./external-link";

export function VitalizeExpandable() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p>
        Co-founder of{" "}
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="site-link inline cursor-pointer border-0 bg-transparent p-0 font-inherit"
        >
          Vitalize
        </button>
        , where I built autonomous labor optimization for hospitals.
      </p>
      <ExpandableAside open={expanded}>
        <p className="pt-1 text-muted">
          Scaled{" "}
          <ExternalLink href="https://vitalize.care" showArrow>
            Vitalize
          </ExternalLink>{" "}
          to run in production at 10 health systems (35+ hospitals), $15M in
          revenue, and a $30M Series A led by Oak HC/FT and Norwest.
        </p>
      </ExpandableAside>
    </>
  );
}
