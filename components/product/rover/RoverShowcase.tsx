import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NativeVideoPlayer } from "@/components/product/ai-glasses/NativeVideoPlayer";
import {
  ROVER_ASSISTANT_ORDER,
  ROVER_AUDIO_ORDER,
  ROVER_CAPTURE_ORDER,
  ROVER_EDITING_ORDER,
  ROVER_MEDIA,
  ROVER_POWER_ORDER,
  ROVER_SAFETY_ORDER,
  ROVER_SHARE_ORDER,
  type RoverCopy,
  type RoverFeatureCopy,
} from "@/lib/content/bleequp-rover";
import { cn } from "@/lib/utils";
import { RoverArtImage, isRoverVideo, type RoverMedia } from "./RoverArtImage";
import { RoverCompareTable } from "./RoverCompareTable";
import { RoverFilmDialog } from "./RoverFilmDialog";
import { RoverMediaTabs, type RoverMediaTabItem } from "./RoverMediaTabs";
import { RoverPillars } from "./RoverPillars";

type Props = {
  copy: RoverCopy;
  /** Where the bottom CTA sends people (PDP: back to the buy box; elsewhere: the Rover PDP). */
  ctaHref: string;
  className?: string;
};

function SectionHeading({
  title,
  sub,
  align = "center",
}: {
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{sub}</p>}
    </div>
  );
}

function MediaCard({ media, copy }: { media: RoverMedia; copy: RoverFeatureCopy }) {
  return (
    <article className="flex min-w-0 flex-col gap-3">
      {isRoverVideo(media) ? (
        <NativeVideoPlayer src={media.mp4} poster={media.poster} title={copy.title} posterWidth={640} />
      ) : (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <RoverArtImage image={media} alt={copy.title} sizes="(max-width: 640px) 100vw, 33vw" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{copy.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
      </div>
    </article>
  );
}

function tabItems<K extends string>(
  order: readonly K[],
  copy: Record<K, { tab: string; title: string; body: string }>,
  media: Record<K, RoverMedia>,
): RoverMediaTabItem[] {
  return order.map((key) => ({ key, ...copy[key], media: media[key] }));
}

export function RoverShowcase({ copy, ctaHref, className }: Props) {
  return (
    <div className={cn("min-w-0 max-w-full space-y-16 overflow-x-clip sm:space-y-20", className)}>
      {/* Hero */}
      <section className="relative min-w-0 overflow-hidden rounded-2xl bg-black text-white">
        <RoverArtImage
          image={ROVER_MEDIA.hero}
          alt={copy.hero.headline}
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="absolute inset-0"
          imgClassName="opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative flex min-h-[420px] flex-col justify-end p-6 sm:min-h-[520px] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {copy.hero.kicker}
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            {copy.hero.headline}
          </h2>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-white/70">
            {copy.hero.tagline}
          </p>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">{copy.hero.sub}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <RoverFilmDialog label={copy.hero.watchFilm} title={copy.hero.filmTitle} />
          </div>
        </div>
      </section>

      {/* Six pillars */}
      <section>
        <SectionHeading title={copy.pillars.title} sub={copy.pillars.sub} />
        <RoverPillars copy={copy.pillars} className="mt-10" />
      </section>

      {/* Statement loop */}
      <section className="grid min-w-0 items-center gap-6 lg:grid-cols-2 lg:gap-10">
        <SectionHeading title={copy.statement.title} sub={copy.statement.sub} align="left" />
        <NativeVideoPlayer
          src={ROVER_MEDIA.statement.mp4}
          poster={ROVER_MEDIA.statement.poster}
          title={copy.statement.title}
        />
      </section>

      {/* Capture features */}
      <section>
        <SectionHeading title={copy.capture.title} sub={copy.capture.sub} />
        <RoverMediaTabs
          className="mt-10"
          items={tabItems(ROVER_CAPTURE_ORDER, copy.capture.items, ROVER_MEDIA.capture)}
        />
      </section>

      {/* AI editing */}
      <section className="rounded-2xl border bg-muted/30 p-6 sm:p-10">
        <SectionHeading title={copy.editing.title} sub={copy.editing.sub} />
        <RoverMediaTabs
          className="mt-10"
          items={tabItems(ROVER_EDITING_ORDER, copy.editing.items, ROVER_MEDIA.editing)}
        />
      </section>

      {/* Share */}
      <section>
        <SectionHeading title={copy.share.title} sub={copy.share.sub} />
        <RoverMediaTabs
          className="mt-10"
          items={tabItems(ROVER_SHARE_ORDER, copy.share.items, ROVER_MEDIA.share)}
        />
      </section>

      {/* Companion + safety */}
      <section className="space-y-10">
        <SectionHeading title={copy.companion.title} />
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
            {copy.companion.assistantTitle}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ROVER_ASSISTANT_ORDER.map((key) => (
              <MediaCard key={key} media={ROVER_MEDIA.companion[key]} copy={copy.companion.assistant[key]} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
            {copy.companion.safetyTitle}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {ROVER_SAFETY_ORDER.map((key) => (
              <MediaCard key={key} media={ROVER_MEDIA.companion[key]} copy={copy.companion.safety[key]} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{copy.companion.alertsNote}</p>
        </div>
      </section>

      {/* Audio */}
      <section className="rounded-2xl border bg-muted/30 p-6 sm:p-10">
        <SectionHeading title={copy.audio.title} sub={copy.audio.sub} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ROVER_AUDIO_ORDER.map((key) => (
            <MediaCard key={key} media={ROVER_MEDIA.audio[key]} copy={copy.audio.items[key]} />
          ))}
        </div>
      </section>

      {/* Power / control */}
      <section>
        <SectionHeading title={copy.power.title} sub={copy.power.sub} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {ROVER_POWER_ORDER.map((key) => (
            <MediaCard key={key} media={ROVER_MEDIA.power[key]} copy={copy.power.items[key]} />
          ))}
        </div>
      </section>

      {/* In the box + key specs */}
      <section className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="min-w-0 overflow-hidden rounded-2xl border">
          <div className="relative aspect-[4/3] bg-muted">
            <RoverArtImage image={ROVER_MEDIA.box} alt={copy.box.title} sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{copy.box.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.box.sub}</p>
            <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {copy.box.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{copy.specs.title}</h2>
          <dl className="mt-4 divide-y text-sm">
            {copy.specs.items.map((spec) => (
              <div key={spec.label} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-4">
                <dt className="font-medium">{spec.label}</dt>
                <dd className="text-muted-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Compare */}
      <section>
        <SectionHeading title={copy.compare.title} sub={copy.compare.sub} />
        <RoverCompareTable copy={copy.compare} className="mt-10" />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl">
        <SectionHeading title={copy.faq.title} />
        <div className="mt-8 divide-y rounded-2xl border">
          {copy.faq.items.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.q}
                <span className="text-muted-foreground transition group-open:rotate-90" aria-hidden>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-2xl bg-black text-white">
        <RoverArtImage
          image={ROVER_MEDIA.cta}
          alt={copy.cta.title}
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="absolute inset-0"
          imgClassName="opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative flex min-h-[320px] flex-col justify-center p-6 sm:min-h-[400px] sm:p-10">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">{copy.cta.title}</h2>
          <p className="mt-3 max-w-lg text-base text-white/80 sm:text-lg">{copy.cta.sub}</p>
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 w-fit bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {copy.cta.button} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
