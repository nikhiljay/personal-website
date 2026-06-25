export function ExternalLink({
  href,
  children,
  className = "site-link",
  target = "_blank",
  rel = "noopener noreferrer",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}) {
  return (
    <a href={href} target={target} rel={rel} className={className}>
      {children}
    </a>
  );
}
