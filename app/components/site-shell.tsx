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
    <div className="min-h-screen bg-bg">
      <main
        className={`mx-auto w-full max-w-[640px] pb-32 ${
          mobileBleed ? "px-0 md:px-6" : "px-6"
        } ${compact ? "pt-16" : "pt-32"}`}
      >
        {children}
      </main>
    </div>
  );
}
