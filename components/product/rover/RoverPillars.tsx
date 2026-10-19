import { ROVER_MEDIA, ROVER_PILLAR_ORDER, type RoverCopy } from "@/lib/content/bleequp-rover";
import { RoverArtImage } from "./RoverArtImage";
import { cn } from "@/lib/utils";

type Props = {
  copy: RoverCopy["pillars"];
  className?: string;
};

export function RoverPillars({ copy, className }: Props) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {ROVER_PILLAR_ORDER.map((key) => {
        const item = copy.items[key];
        return (
          <article
            key={key}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-black text-white sm:aspect-[4/3]"
          >
            <RoverArtImage
              image={ROVER_MEDIA.pillars[key]}
              alt={item.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="absolute inset-0"
              imgClassName="transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-1 text-sm text-white/80">{item.tagline}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
