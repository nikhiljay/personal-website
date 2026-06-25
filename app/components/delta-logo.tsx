export function DeltaLogo({ className }: { className?: string }) {
  return (
    <img
      src="/images/delta-widget.png"
      alt=""
      aria-hidden="true"
      className={`h-[11px] w-auto shrink-0 ${className ?? ""}`}
    />
  );
}
