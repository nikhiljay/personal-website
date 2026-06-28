import type { Metadata } from "next";

import { AnimateIn } from "../components/animate-in";
import { LazyKaviAskAi } from "../components/lazy-kavi-ask-ai";
import { KaviTripMapSection } from "../components/kavi-trip-map-section";
import { KaviTripWelcome } from "../components/kavi-trip-welcome";
import { SiteShell } from "../components/site-shell";
import { getTripEventsFromCalendar } from "../lib/kavi-trip-calendar";

export const metadata: Metadata = {
  title: "Kavi in New York",
  description: "Map and schedule for Kavi's trip to New York City.",
};

export const revalidate = 900;

export default async function KaviNycTripPage() {
  const tripEvents = await getTripEventsFromCalendar();

  return (
    <SiteShell compact>
      <AnimateIn className="mb-9">
        <KaviTripWelcome />
      </AnimateIn>

      <div className="min-h-[min(480px,68vh)]">
        <KaviTripMapSection tripEvents={tripEvents} />
      </div>

      <LazyKaviAskAi />
    </SiteShell>
  );
}
