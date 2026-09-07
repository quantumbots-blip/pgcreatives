import Image from "next/image";
import { Tilt } from "@/components/tilt";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { getVimeoMetas } from "@/lib/vimeo";

/* Three reels, fanned like a deck.

   The section sells putting an AGENT on camera, so the deck has three jobs at
   once, and missing any one of them makes it argue against itself:

     1. every frame has a person in it (it once held listing interiors),
     2. every person is looking down the lens, and
     3. they are three different people.

   Rule 3 is the one that is easy to break without noticing. The middle and
   right cards were 1164740705 and 1174488968 — two reels, two outfits, two
   locations, and the same agent in both, which reads as a portfolio of one
   client. Compare faces, not hair and coats.

   Rule 2 is the one that cannot be fixed in code. Vimeo picks a single poster
   per video and the public oEmbed hands out only that one, so a subject who is
   mid-turn is a reason to change the reel, not the second: that is what took
   1177445392 out, whose poster catches the agent side-on under a "surprises"
   caption. If you want a specific reel in here, change its thumbnail on Vimeo
   instead.

   The card that used to be a local file is a reel now too, so all three are
   real posters from work the program produced, natively 640x1138 — exactly the
   9:16 these cards crop to.

   Judge a replacement on the poster at 210px wide, not on the video, and on
   the real i.vimeocdn.com frame: vumbnail.com serves a landscape crop that
   makes every subject look closer than they render here. */
const REELS = [
  {
    id: "1156930119",
    alt: "Agent looking to camera outside a lakefront listing, for a personal-brand reel",
  },
  {
    id: "1163714583",
    alt: "Agent talking straight to camera in a kitchen, for a personal-brand reel",
  },
  {
    id: "1174488968",
    alt: "Agent looking to camera outside a property, for a personal-brand reel",
  },
];
const REEL_IDS = REELS.map((reel) => reel.id);

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
  const reels = REELS.map(({ id, alt }) => ({
    src: metas[id]?.thumbnail ?? `https://vumbnail.com/${id}.jpg`,
    alt,
  }));

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
