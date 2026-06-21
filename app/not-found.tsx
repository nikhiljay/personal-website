import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto max-w-[540px] px-6 py-24 sm:py-32">
        <p className="text-[15px] leading-[1.7] text-muted">Page not found.</p>
        <Link href="/" className="site-link mt-6 inline-block text-[15px]">
          Go home
        </Link>
      </main>
    </div>
  );
}
