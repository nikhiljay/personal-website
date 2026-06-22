import { SiteStatusBar } from "./site-status-bar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto w-full max-w-[640px] px-6 py-32">
        <SiteStatusBar />
        {children}
      </main>
    </div>
  );
}
