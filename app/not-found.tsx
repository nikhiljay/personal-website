import Link from "next/link";

import { SiteShell } from "./components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <h1 className="mb-7 text-[15px] font-normal text-fg">Not found</h1>
      <p className="mb-7 text-muted">Page not found.</p>
      <Link href="/" className="site-link mt-4 inline-block">
        Go home
      </Link>
    </SiteShell>
  );
}
