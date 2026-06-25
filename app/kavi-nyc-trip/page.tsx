import type { Metadata } from "next";

import { AnimateIn } from "../components/animate-in";
import { KaviTripMapSection } from "../components/kavi-trip-map-section";
import { SerifEm } from "../components/serif-em";
import { SiteShell } from "../components/site-shell";
import { getTripEventsFromCalendar } from "../lib/kavi-trip-calendar";

export const metadata: Metadata = {
  title: "AHLA NYC Trip",
  description: "Map and schedule for Kavi's AHLA trip in New York City.",
};

export const revalidate = 900;

export default async function KaviNycTripPage() {
  const tripEvents = await getTripEventsFromCalendar();

  return (
    <SiteShell compact mobileBleed>
      <AnimateIn className="mb-7 px-6 md:px-0">
        <h1 className="text-[26px] leading-[1.25] font-normal text-fg">
          Welcome to New York, <SerifEm>Kavi</SerifEm>.
        </h1>
      </AnimateIn>

      <AnimateIn stagger={1}>
        <KaviTripMapSection tripEvents={tripEvents} />
      </AnimateIn>
    </SiteShell>
  );
}
