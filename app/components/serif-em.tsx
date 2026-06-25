export function SerifEm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <em className={className ? `serif-em ${className}` : "serif-em"}>{children}</em>;
}
