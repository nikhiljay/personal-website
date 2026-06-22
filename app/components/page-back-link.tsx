import Link from "next/link";

export function PageBackLink() {
  return (
    <div className="mb-7">
      <Link
        href="/"
        className="text-body no-underline transition-colors hover:text-fg"
      >
        ← <em className="serif-em">Index</em>
      </Link>
    </div>
  );
}
