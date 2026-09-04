import Image from "next/image";
import { Tilt } from "@/components/tilt";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { getVimeoMetas } from "@/lib/vimeo";

/* Three reels, fanned like a deck.

   The section sells putting an AGENT on camera, so all three frames have to
   have one in them — two of these were listing interiors, which illustrated
   the wrong thing. The second and third are real poster frames from reels the
   program actually produced, pulled from Vimeo at build time, and they are
   natively 640x1138, which is exactly the 9:16 these cards crop to. */
const REEL_IDS = ["1177445392", "1174488968"];

const localReel = {
  src: "/images/dark-home-office.jpg",
  alt: "Real estate agent filmed on location for a personal-brand reel",
};

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

export async function ProgramShowcaseDeck() {
  const metas = await getVimeoMetas(REEL_IDS);
  const reels = [
    localReel,
    ...REEL_IDS.map((id, i) => ({
      src: metas[id]?.thumbnail ?? `https://vumbnail.com/${id}.jpg`,
      alt:
        i === 0
          ? "Agent talking to camera in a kitchen for a personal-brand reel"
          : "Agent filmed outside a property for a personal-brand reel",
    })),
  ];

  return (
      <AnimateOnScroll animation="depth" delay={0.12} className="scene">
        <div className="reel-deck" aria-hidden="false">
          {reels.map((reel, i) => (
            <Tilt key={reel.src} className={`reel-card reel-card-${i}`} max={8} lift={22}>
              <figure className="viewfinder relative aspect-[9/16] overflow-hidden rounded-[1.75rem] border border-line-strong bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
                <span className="vf-b" aria-hidden="true" />
                <Image
                  src={reel.src}
                  alt={reel.alt}
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
      <ol className="stage-track mt-20 sm:mt-24">
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
