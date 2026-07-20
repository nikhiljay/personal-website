"use client";

export function ExpandLink({
  expanded,
  onOpenChange,
  children,
  className = "site-link inline cursor-pointer border-0 bg-transparent p-0 font-inherit",
}: {
  expanded: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenChange(!expanded)}
      aria-expanded={expanded}
      className={className}
    >
      {children}
    </button>
  );
}
