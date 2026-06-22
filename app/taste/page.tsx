import type { Metadata } from "next";

import { AnimateIn } from "../components/animate-in";
import { PageBackLink } from "../components/page-back-link";
import { SiteShell } from "../components/site-shell";
import { TasteGrid } from "../components/taste-grid";
import { tasteSections } from "../lib/taste";

export const metadata: Metadata = {
  title: "Taste · Nikhil D'Souza",
  description: "Personal stack, reading list, and favorite food spots.",
};

export default function TastePage() {
  return (
    <SiteShell>
      <AnimateIn>
        <PageBackLink />
      </AnimateIn>
      <AnimateIn as="h1" className="text-[15px] font-normal text-fg" stagger={1}>
        Taste
      </AnimateIn>
      <AnimateIn as="p" className="mb-10 text-muted" stagger={2}>
        Stack, reading, and food.
      </AnimateIn>
      <AnimateIn stagger={3}>
        <TasteGrid sections={tasteSections} />
      </AnimateIn>
    </SiteShell>
  );
}
