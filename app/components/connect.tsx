const socialLinks = [
  {
    href: "https://www.linkedin.com/in/nikhiljdsouza/",
    label: "LinkedIn",
  },
  {
    href: "https://github.com/nikhiljay",
    label: "GitHub",
  },
  {
    href: "https://twitter.com/nikhiljdsouza",
    label: "X",
  },
] as const;

export function Connect() {
  return (
    <footer className="mt-6 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted">
      {socialLinks.map((link, index) => (
        <span key={link.href} className="contents">
          {index > 0 ? (
            <span aria-hidden="true" className="text-body/20">
              /
            </span>
          ) : null}
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="no-underline transition-colors hover:text-body"
          >
            {link.label}
          </a>
        </span>
      ))}
    </footer>
  );
}
