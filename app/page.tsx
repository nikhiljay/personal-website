import Link from "next/link";

import { Connect } from "./components/connect";
import { ExternalLink } from "./components/external-link";
import { SerifEm } from "./components/serif-em";
import { SiteShell } from "./components/site-shell";

export default function HomePage() {
  return (
    <SiteShell>
      <h1 className="mb-7 font-display text-base font-medium text-body">
        Nikhil D&apos;Souza
      </h1>

      <div className="[&>p:not(:last-child)]:mb-4">
        <p>
          Co-founded{" "}
          <ExternalLink href="https://vitalize.care">Vitalize</ExternalLink>,
          where I built autonomous labor optimization for hospitals.
        </p>
        <p>
          <SerifEm>I&apos;m passionate</SerifEm> about continuous growth, using data to tell compelling
          stories, and solving tough engineering problems in healthcare. Based
          in San Francisco, CA.
        </p>
        <p>
          In my free time you&apos;ll find me{" "}
          <ExternalLink href="https://www.strava.com/athletes/nikhiljay">
            training
          </ExternalLink>{" "}
          for a triathlon, salsa dancing, playing tennis, or at the piano.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="section-label">Building</h2>
        <div className="mt-5 w-48">
          <Link
            href="/taste"
            className="text-body no-underline transition-colors hover:text-fg"
          >
            Taste
          </Link>
          <p className="text-[13px] leading-5 text-muted">
            Stack, reading, and food.
          </p>
        </div>
      </section>

      <Connect />
    </SiteShell>
  );
}
