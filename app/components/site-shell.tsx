export function SiteShell({
  children,
  compact = false,
  mobileBleed = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
  mobileBleed?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <main
        className={`mx-auto w-full max-w-[640px] ${
          mobileBleed ? "px-0 md:px-6" : "px-6"
        } ${compact ? "pt-24 pb-28 md:pt-16" : "pt-24 pb-16 md:py-32"}`}
      >
        {children}
      </main>
    </div>
  );
}
