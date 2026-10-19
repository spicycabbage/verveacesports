"use client";

import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { ROVER_MEDIA } from "@/lib/content/bleequp-rover";
import { sizedImageUrl } from "@/lib/images/cdn";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  title: string;
  className?: string;
};

/** Launch TVC is ~38 MB — never mounted until the user asks for it. */
export function RoverFilmDialog({ label, title, className }: Props) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white",
          className,
        )}
      >
        <Play className="mr-1.5 h-4 w-4" />
        {label}
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-5xl overflow-hidden border-0 bg-black p-0 ring-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <video
          className="aspect-video h-auto w-full max-w-full bg-black"
          src={ROVER_MEDIA.film.mp4}
          poster={sizedImageUrl(ROVER_MEDIA.film.poster, 1600)}
          controls
          autoPlay
          playsInline
          preload="metadata"
          aria-label={title}
        />
      </DialogContent>
    </Dialog>
  );
}
