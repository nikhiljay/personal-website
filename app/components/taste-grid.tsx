import { ExternalLink } from "./external-link";
import type { TasteItem, TasteSection } from "../lib/taste";

function TasteEntry({ item }: { item: TasteItem }) {
  return (
    <div>
      {item.href ? (
        <ExternalLink href={item.href}>{item.title}</ExternalLink>
      ) : (
        <span className="text-fg">{item.title}</span>
      )}
      {item.description ? (
        <p className="text-[13px] leading-5 text-muted">{item.description}</p>
      ) : null}
    </div>
  );
}

function TasteColumn({ section }: { section: TasteSection }) {
  return (
    <div className="w-full sm:w-48">
      <h2 className="section-label">{section.title}</h2>
      <div className="mt-5 space-y-6">
        {section.items.map((item) => (
          <TasteEntry key={item.title} item={item} />
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
