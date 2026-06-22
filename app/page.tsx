import Link from "next/link";

import { Connect } from "./components/connect";
import { ExternalLink } from "./components/external-link";
import { GlowName } from "./components/glow-name";
import { SerifEm } from "./components/serif-em";
import { SiteShell } from "./components/site-shell";
import { SiteStatusBar } from "./components/site-status-bar";

export default function HomePage() {
  return (
    <SiteShell>
      <div className="mb-7 flex w-full items-center">
        <GlowName />
        <div className="ml-auto min-w-0 shrink-0 pl-4">
          <SiteStatusBar />
        </div>
      </div>

      <div className="text-[15px] leading-[1.7] [&>p:not(:last-child)]:mb-4">
        <p>
          Co-founded{" "}
          <ExternalLink href="https://vitalize.care">Vitalize</ExternalLink>,
          where I built autonomous labor optimization for hospitals.
        </p>
        <p>
          I&apos;m passionate about
          continuous growth, using data to tell compelling stories, and solving
          tough engineering problems in healthcare. Based in San Francisco, CA.
        </p>
        <p>
          <SerifEm>Chasing novel experiences</SerifEm>. In my free time, you&apos;ll find me{" "}
          <ExternalLink href="https://www.strava.com/athletes/nikhiljay">
            training
          </ExternalLink>{" "}
          for a triathlon, salsa dancing, playing tennis, or at the piano.
        </p>
      </div>

      <section className="my-12">
        <div className="my-5 w-48">
          <Link
            href="/taste"
            className="text-[15px] no-underline transition-colors hover:text-fg"
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
