import { AnimateIn } from "./components/animate-in";
import { Connect } from "./components/connect";
import { ExternalLink } from "./components/external-link";
import { GlowName } from "./components/glow-name";
import { SerifEm } from "./components/serif-em";
import { SiteShell } from "./components/site-shell";
import { SiteStatusBar } from "./components/site-status-bar";
import { TasteGrid } from "./components/taste-grid";
import { tasteSections } from "./lib/taste";

export default function HomePage() {
  return (
    <SiteShell>
      <AnimateIn className="mb-7 flex w-full items-center">
        <GlowName>Nikhil D&apos;Souza</GlowName>
        <div className="ml-auto min-w-0 shrink-0 pl-4">
          <SiteStatusBar />
        </div>
      </AnimateIn>

      <div className="text-[15px] leading-[1.7] [&>p:not(:last-child)]:mb-4">
        <AnimateIn as="p" stagger={1}>
          Co-founder of{" "}
          <ExternalLink href="https://vitalize.care">Vitalize</ExternalLink>,
          where I built autonomous labor optimization for hospitals.
        </AnimateIn>
        <AnimateIn as="p" stagger={2}>
          I&apos;m passionate about
          continuous growth, using data to tell compelling stories, and solving
          tough engineering problems. Based in San Francisco, CA.
        </AnimateIn>
        <AnimateIn as="p" stagger={3}>
          <SerifEm>Chasing novel experiences</SerifEm>. In my free time, you&apos;ll find me{" "}
          <ExternalLink href="https://www.strava.com/athletes/nikhiljay">
            training
          </ExternalLink>{" "}
          for a triathlon, salsa dancing, playing tennis, or at the piano.
        </AnimateIn>
      </div>

      <AnimateIn as="section" className="my-12 text-[13px] leading-5" stagger={4}>
        <TasteGrid sections={tasteSections} />
      </AnimateIn>

      <AnimateIn stagger={5}>
        <Connect />
      </AnimateIn>
    </SiteShell>
  );
}
