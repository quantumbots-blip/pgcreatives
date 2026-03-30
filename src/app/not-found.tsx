import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <h2 className="text-6xl font-bold text-white">404</h2>
      <p className="mt-3 text-lg text-white/60">Page not found</p>
      <p className="mt-1 text-sm text-white/40">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-purple px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-light"
      >
        Go Home
      </Link>
    </div>
  );
}
