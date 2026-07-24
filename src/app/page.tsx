import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import { EDITORIAL_IMAGES } from "@/lib/images";

const LOOP_STEPS = [
  {
    n: "01",
    title: "Signal",
    body: "Real weather and hazard readings come in from the ground - no simulated numbers pretending to be live.",
  },
  {
    n: "02",
    title: "Generate",
    body: "An AI layer turns the raw reading into a short, plain-language, action-first warning - not a meteorological bulletin.",
  },
  {
    n: "03",
    title: "Communicate",
    body: "The warning goes out across channels people actually use - a real Telegram message, simulated SMS and USSD.",
  },
  {
    n: "04",
    title: "Understand",
    body: "Recipients confirm with one tap: understood, or need more info. No confirmation, no assumption of safety.",
  },
  {
    n: "05",
    title: "Escalate",
    body: "When confirmation lags, a second AI pass reads the gap and recommends a concrete fallback - like switching to radio.",
  },
];

export default function Home() {
  return (
    <div className="flex-1">
      <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden">
        <Image
          src={EDITORIAL_IMAGES.hero.src}
          alt={EDITORIAL_IMAGES.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
          <p className="mb-4 text-[11px] font-data uppercase tracking-[0.18em] text-paper/80">
            IGAD Hackathon 2026 - Smarter Early Warning, Stronger Communities
          </p>
          <h1 className="max-w-3xl font-[family-name:var(--font-headline)] text-5xl leading-[1.05] text-paper md:text-7xl">
            Warnings people actually understand.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/85">
            Kestrel turns raw hazard data into plain-language, hyperlocal warnings -
            and is the first system in this space that verifies the warning was
            received and understood, not just sent.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/map"
              className="bg-accent px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent-ink"
            >
              See it live on the map
            </Link>
            <Link href="/admin" className="text-sm text-paper/85 underline underline-offset-4 hover:text-paper">
              Officer console
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <ScrollReveal>
          <p className="max-w-2xl text-[11px] font-data uppercase tracking-[0.16em] text-ink-faint">
            The gap IGAD named
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl md:text-4xl">
            Most early-warning systems stop at &ldquo;alert issued.&rdquo;
          </h2>
          <p className="mt-6 max-w-2xl text-ink-muted leading-relaxed">
            Information has to be generated, communicated, understood, and turned
            into action. Generic SMS blasts and technical bulletins routinely fail
            at the last two steps - and there is no mechanism to check who actually
            received and comprehended a warning until damage is already done.
            Kestrel closes that loop, end to end.
          </p>
        </ScrollReveal>

        <div className="mt-20 grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-5">
          {LOOP_STEPS.map((step, i) => (
            <ScrollReveal key={step.n} delay={i * 0.06} className="lg:col-span-1">
              <span className="font-data text-sm text-accent">{step.n}</span>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="relative h-[64vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={EDITORIAL_IMAGES.kestrel.src}
          alt={EDITORIAL_IMAGES.kestrel.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/25" />
        <div className="relative z-10 flex h-full max-w-7xl mx-auto items-end px-6 pb-14 md:px-10">
          <ScrollReveal>
            <p className="max-w-md text-paper/90 text-lg leading-relaxed font-[family-name:var(--font-headline)] italic">
              A kestrel hunts by hovering perfectly still, watching the ground for
              the smallest signal of movement - then acts, precisely, the moment it matters.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-10">
          <ScrollReveal className="md:col-span-5">
            <p className="text-[11px] font-data uppercase tracking-[0.16em] text-ink-faint">
              Who this is for
            </p>
            <h2 className="mt-4 text-3xl">
              Built for the officers coordinating the response.
            </h2>
            <p className="mt-6 text-ink-muted leading-relaxed">
              National and regional disaster-management officers and NGOs are the
              primary users - the decision-makers IGAD serves directly. Community
              focal points confirm receipt on the ground; the at-risk community
              itself is represented only as aggregate confirmation data, never
              individual identity.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="md:col-span-7 relative aspect-[16/10] overflow-hidden">
            <Image
              src={EDITORIAL_IMAGES.community.src}
              alt={EDITORIAL_IMAGES.community.alt}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-2xl max-w-lg">
            Every warning here is generated from a real reading - see it move through the loop.
          </p>
          <div className="flex gap-6 shrink-0">
            <Link href="/warnings" className="text-sm underline underline-offset-4 hover:text-accent-ink">
              Warning feed
            </Link>
            <Link href="/dashboard" className="text-sm underline underline-offset-4 hover:text-accent-ink">
              Verification dashboard
            </Link>
            <Link href="/about-data" className="text-sm underline underline-offset-4 hover:text-accent-ink">
              About the data
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
