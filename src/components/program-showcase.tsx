import Image from "next/image";
import { Tilt } from "@/components/tilt";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

/* Three reels, fanned like a deck.
   Real frames from real shoots, cropped to the 9:16 the program actually
   delivers, so the visual is the product rather than an illustration of it. */
const reels = [
  { src: "/images/dark-home-office.jpg", alt: "Agent filmed on location for a personal-brand reel" },
  { src: "/images/marble-chef-kitchen.jpg", alt: "Kitchen detail filmed for a listing reel" },
  { src: "/images/lakefront-screened-porch.jpg", alt: "Screened porch filmed for a listing reel" },
];

/* The five outcomes as the sequence they actually are.
   They were a bulleted list of benefits in no particular order; read closely
   they describe one journey, from being seen to signing the deal. Numbering
   them is honest here because the order is real: nobody gets inbound leads
   before anyone knows who they are. */
const stages = [
  { step: "Show up", detail: "Stay top of mind in your market." },
  { step: "Build trust", detail: "A personal brand people believe." },
  { step: "Get found", detail: "Inbound leads instead of chasing them." },
  { step: "Stand out", detail: "Authority, so clients pick you first." },
  { step: "Close", detail: "Views become conversations, conversations become deals." },
];

export function ProgramShowcaseDeck() {
  return (
      <AnimateOnScroll animation="depth-right" delay={0.12} className="scene">
        <div className="reel-deck" aria-hidden="false">
          {reels.map((reel, i) => (
            <Tilt key={reel.src} className={`reel-card reel-card-${i}`} max={8} lift={22}>
              <figure className="viewfinder relative aspect-[9/16] overflow-hidden rounded-[1.75rem] border border-line-strong bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
                <span className="vf-b" aria-hidden="true" />
                <Image
                  src={reel.src}
                  alt={i === 0 ? reel.alt : ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 30vw, 210px"
                />
                <span className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />
              </figure>
            </Tilt>
          ))}
        </div>
      </AnimateOnScroll>
  );
}

export function ProgramShowcaseStages() {
  return (
      /* The journey, drawn. A connector runs behind the nodes so the five
         read as one sequence rather than five unrelated claims. */
      <ol className="stage-track mt-16 sm:mt-24">
        {stages.map((stage, i) => (
          <AnimateOnScroll
            key={stage.step}
            as="li"
            animation="depth"
            delay={i * 0.08}
            className="stage"
          >
            <span className="stage-node">{String(i + 1).padStart(2, "0")}</span>
            <p className="stage-step">{stage.step}</p>
            <p className="stage-detail">{stage.detail}</p>
          </AnimateOnScroll>
        ))}
      </ol>
  );
}
