"use client";

import { useState } from "react";

import { SerifEm } from "./serif-em";
import { ExpandableAside } from "./expandable-aside";

export function KaviTripWelcome() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <h1 className="text-[26px] leading-[1.25] font-normal text-fg">
        Welcome to{" "}
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="site-link text-fg inline cursor-pointer border-0 bg-transparent p-0 font-inherit"
        >
          New York
        </button>
        , <SerifEm>Kavi</SerifEm>.
      </h1>
      <ExpandableAside open={expanded}>
        <div className="flex flex-col gap-3 pt-4 text-[13px] leading-5 text-muted">
          <p>
            &ldquo;There is no place like it, no place with an atom of its glory,
            pride, and exultancy.&rdquo; - Walt Whitman
          </p>
          <p>
            This city is lucky to have you for the week. As always, go easy on
            yourself. Remember that confidence is your biggest asset - you&apos;ve
            got more of it than you think. Have fun and call me when you can!
          </p>
          <p>
            Love you,
            <br />
            <SerifEm className="text-muted">Nikhil</SerifEm>
          </p>
        </div>
      </ExpandableAside>
    </>
  );
}
