import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROVER_MEDIA, ROVER_PRIMARY_SLUG, type RoverCopy } from "@/lib/content/bleequp-rover";
import { cn } from "@/lib/utils";
import { RoverArtImage } from "./RoverArtImage";
import { RoverFilmDialog } from "./RoverFilmDialog";
import { RoverPillars } from "./RoverPillars";

const ROVER_HREF = `/products/${ROVER_PRIMARY_SLUG}`;

/** Home-page teaser for the Rover line: banner + six pillars, linking to the PDP. */
export function RoverHomeSection({ copy }: { copy: RoverCopy }) {
  return (
    <section id="rover" className="scroll-mt-24 border-b">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl bg-black text-white">
          <RoverArtImage
            image={ROVER_MEDIA.hero}
            alt={copy.home.title}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="absolute inset-0"
            imgClassName="opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="relative flex min-h-[420px] flex-col justify-end p-6 sm:min-h-[520px] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {copy.home.kicker} · {copy.hero.kicker}
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              {copy.hero.headline}
            </h2>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">{copy.home.sub}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={ROVER_HREF}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {copy.home.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <RoverFilmDialog label={copy.hero.watchFilm} title={copy.hero.filmTitle} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.pillars.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{copy.pillars.sub}</p>
          </div>
          <Link href={ROVER_HREF} className="text-sm font-medium text-primary hover:underline">
            {copy.home.learnMore} →
          </Link>
        </div>
        <RoverPillars copy={copy.pillars} className="mt-6" />
      </div>
    </section>
  );
}
