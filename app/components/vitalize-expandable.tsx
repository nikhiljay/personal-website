"use client";

import { useState } from "react";

import { ExpandLink } from "./expand-link";
import { ExpandableAside } from "./expandable-aside";
import { ExternalLink } from "./external-link";

export function VitalizeExpandable() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p>
        Co-founder of{" "}
        <ExpandLink expanded={expanded} onOpenChange={setExpanded}>
          Vitalize
        </ExpandLink>
        , where I built autonomous labor optimization for hospitals.
      </p>
      <ExpandableAside open={expanded}>
        <p className="pt-1 text-muted">
          As CTO, I led eng &amp; product and scaled{" "}
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
