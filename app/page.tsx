import { AnimateIn } from "./components/animate-in";
import { Connect } from "./components/connect";
import { GlowName } from "./components/glow-name";
import { ResearchExpandable } from "./components/research-expandable";
import { SiteShell } from "./components/site-shell";
import { SiteStatusBar } from "./components/site-status-bar";
import { VitalizeExpandable } from "./components/vitalize-expandable";

export default function HomePage() {
  return (
    <SiteShell>
      <AnimateIn className="mb-7 flex w-full items-center">
        <GlowName>Nikhil D&apos;Souza</GlowName>
        <div className="ml-auto min-w-0 shrink-0 pl-4">
          <SiteStatusBar />
        </div>
      </AnimateIn>

      <div className="flex flex-col gap-4 text-[15px] leading-[1.7]">
        <AnimateIn stagger={1}>
          <VitalizeExpandable />
        </AnimateIn>
        <AnimateIn stagger={2}>
          <ResearchExpandable />
        </AnimateIn>
      </div>

      <AnimateIn className="mt-9" stagger={3}>
        <Connect />
      </AnimateIn>
    </SiteShell>
  );
}
