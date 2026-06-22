import { ExternalLink } from "./external-link";

export function Connect() {
  return (
    <section className="mt-16">
      <h2 className="section-label">Connect</h2>
      <p className="mt-7">
        Find me on{" "}
        <ExternalLink href="https://www.linkedin.com/in/nikhiljdsouza/">
          LinkedIn
        </ExternalLink>
        ,{" "}
        <ExternalLink href="https://github.com/nikhiljay">GitHub</ExternalLink>
        , or <ExternalLink href="https://twitter.com/nikhiljdsouza">X</ExternalLink>
        .
      </p>
    </section>
  );
}
