import { ExternalLink } from "./external-link";

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/nikhiljdsouza/",
    label: "LINKEDIN",
  },
  {
    href: "https://github.com/nikhiljay",
    label: "GITHUB",
  },
  {
    href: "https://nikhiljdsouza.substack.com",
    label: "SUBSTACK",
  },
  {
    href: "https://twitter.com/nikhiljdsouza",
    label: "X",
  },
] as const;

export function Connect() {
  return (
    <footer className="mt-6 flex flex-wrap items-center gap-x-1.5 font-mono text-xs uppercase text-muted">
      {socialLinks.map((link, index) => (
        <span key={link.href} className="contents">
          {index > 0 ? (
            <span aria-hidden="true" className="text-body/20">
              /
            </span>
          ) : null}
          <ExternalLink
            href={link.href}
            className="no-underline transition-colors hover:text-body"
          >
            {link.label}
          </ExternalLink>
        </span>
      ))}
    </footer>
  );
}
