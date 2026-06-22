import type { Metadata } from "next";

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
      <PageBackLink />
      <h1 className="text-[15px] font-normal text-fg">Taste</h1>
      <p className="mb-10 text-muted">Stack, reading, and food.</p>
      <TasteGrid sections={tasteSections} />
    </SiteShell>
  );
}
