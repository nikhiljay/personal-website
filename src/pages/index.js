import { withPrefix } from "gatsby";
import * as React from "react";

import Layout from "../components/layout";
import Seo from "../components/seo";

const ExternalLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="site-link"
  >
    {children}
  </a>
);

const FooterLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="footer-link">
    {children}
  </a>
);

const IndexPage = () => (
  <Layout>
    <header className="mb-10">
      <h1 className="text-lg font-medium tracking-[-0.01em] text-fg">
        Nikhil D&apos;Souza
      </h1>
    </header>

    <div className="space-y-6 text-[15px] leading-[1.7] text-muted">
      <p>
        Co-founder &amp; CTO of{" "}
        <ExternalLink href="https://vitalize.care">
          Vitalize Care (YC W23)
        </ExternalLink>
        , where we&apos;re building technology to address critical nursing
        workforce challenges.
      </p>
      <p>
        I&apos;m passionate about continuous growth, using data to tell
        compelling stories, and solving tough engineering problems in
        healthcare. Based in San Francisco.
      </p>
      <p>
        In my free time you&apos;ll find me salsa dancing, swimming, playing
        tennis, or at the piano.
      </p>
    </div>

    <footer className="mt-12 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
      <FooterLink href="mailto:nikhiljay7@gmail.com">Email</FooterLink>
      <span className="mx-2 text-fg/15">/</span>
      <FooterLink href="https://www.linkedin.com/in/nikhiljdsouza/">
        LinkedIn
      </FooterLink>
      <span className="mx-2 text-fg/15">/</span>
      <FooterLink href="https://github.com/nikhiljay">GitHub</FooterLink>
      <span className="mx-2 text-fg/15">/</span>
      <FooterLink href="https://twitter.com/nikhiljdsouza">X</FooterLink>
      <span className="mx-2 text-fg/15">/</span>
      <FooterLink href={withPrefix("/nikhil_dsouza_resume.pdf")}>
        Resume
      </FooterLink>
    </footer>
  </Layout>
);

export const Head = () => <Seo title="Nikhil D'Souza" />;

export default IndexPage;
