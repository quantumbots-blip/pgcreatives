export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-block rounded-full border border-purple/25 bg-purple/10 px-3 py-1 sm:px-4 sm:py-1.5">
      <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-purple-light">
        {children}
      </span>
    </div>
  );
}
