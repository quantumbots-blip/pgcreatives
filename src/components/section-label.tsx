export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center justify-center rounded-full border border-purple/25 bg-purple/10 px-3 h-7 sm:px-4 sm:h-8">
      <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-purple-light leading-none">
        {children}
      </span>
    </div>
  );
}
