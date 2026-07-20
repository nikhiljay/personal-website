import { ArrowUpRight } from "./arrow-up-right";

export function ExternalLink({
  href,
  children,
  className = "site-link",
  target = "_blank",
  rel = "noopener noreferrer",
  showArrow = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  showArrow?: boolean;
}) {
  if (!showArrow) {
    return (
      <a href={href} target={target} rel={rel} className={className}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="inline-flex items-baseline gap-px no-underline"
    >
      <span className={className}>{children}</span>
      <ArrowUpRight
        size="0.85em"
        className="shrink-0 translate-y-[0.12em] text-muted"
      />
    </a>
  );
}
