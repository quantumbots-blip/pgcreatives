import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 sm:px-6">
      <h2 className="text-6xl font-bold text-white">404</h2>
      <p className="mt-3 text-lg text-white/60">Page not found</p>
      <p className="mt-1 text-sm text-white/40">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-gradient-to-r from-purple-dim to-purple px-8 py-3 text-sm font-semibold text-white ring-1 ring-purple/40 shadow-[0_0_15px_rgba(55,140,210,0.25),0_0_40px_rgba(55,140,210,0.1)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(55,140,210,0.4),0_0_50px_rgba(55,140,210,0.15)]"
      >
        Go Home
      </Link>
    </div>
  );
}
