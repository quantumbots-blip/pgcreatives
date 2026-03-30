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
        className="mt-6 rounded-full bg-gradient-to-r from-purple to-purple-light px-8 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(79,110,247,0.3)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(79,110,247,0.5)]"
      >
        Go Home
      </Link>
    </div>
  );
}
