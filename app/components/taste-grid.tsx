import { ExternalLink } from "./external-link";
import type { TasteItem, TasteSection } from "../lib/taste";

function TasteEntry({ item }: { item: TasteItem }) {
  if (item.href) {
    return <ExternalLink href={item.href}>{item.title}</ExternalLink>;
  }

  return <span>{item.title}</span>;
}

function TasteColumn({ section }: { section: TasteSection }) {
  return (
    <div className="w-full sm:w-48">
      <h2 className="text-muted">{section.title}</h2>
      <div className="mt-4 space-y-3">
        {section.items.map((item) => (
          <div key={item.title}>
            <TasteEntry item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasteGrid({ sections }: { sections: TasteSection[] }) {
  return (
    <section className="flex flex-col gap-10 sm:flex-row sm:gap-8">
      {sections.map((section) => (
        <TasteColumn key={section.title} section={section} />
      ))}
    </section>
  );
}
