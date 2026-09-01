import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* The section-opening device.

   A mono label, a hairline running the width of the container, and — when the
   section has one — its utility link anchored at the far end. The rule is what
   announces a new section, which is why sections no longer need 250px of empty
   black to separate themselves. */
export function RuleHead({
  label,
  link,
}: {
  label: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="rule-head">
      <p className="meta">{label}</p>
      <span className="rule-fill" aria-hidden="true" />
      {link && (
        <Link href={link.href} className="rule-link">
          {link.label}
          <ArrowRight className="arrow h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
