export function MapMarkerDot({
  color,
  label,
  className = "inline-block h-2 w-2 shrink-0 rounded-full",
}: {
  color: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ backgroundColor: color }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      title={label}
    />
  );
}
