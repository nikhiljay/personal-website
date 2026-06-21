function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="site-link">
      {children}
    </a>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="footer-link">
      {children}
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto max-w-[540px] px-6 py-24 sm:py-32">
        <header className="mb-4">
          <h1 className="text-lg font-medium tracking-[-0.01em] text-fg">
            Nikhil D&apos;Souza
          </h1>
        </header>

        <div className="space-y-3 text-[15px] leading-[1.7] text-muted">
          <p>
            Co-founded {" "}
            <ExternalLink href="https://vitalize.care">
              Vitalize
            </ExternalLink>
            , where I built autonomous labor optimization for hospitals.
          </p>
          <p>
            I&apos;m passionate about continuous growth, using data to tell
            compelling stories, and solving tough engineering problems in
            healthcare. Based in San Francisco, CA.
          </p>
          <p>
            In my free time you&apos;ll find me{" "}
            <ExternalLink href="https://www.strava.com/athletes/nikhiljay">
              training
            </ExternalLink>{" "}
            for a triathlon, salsa dancing, playing tennis, or at the piano.
          </p>
        </div>

        <footer className="mt-6 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          <FooterLink href="https://www.linkedin.com/in/nikhiljdsouza/">
            LinkedIn
          </FooterLink>
          <span className="mx-2 text-fg/15">/</span>
          <FooterLink href="https://github.com/nikhiljay">GitHub</FooterLink>
          <span className="mx-2 text-fg/15">/</span>
          <FooterLink href="https://twitter.com/nikhiljdsouza">X</FooterLink>
        </footer>
      </main>
    </div>
  );
}
