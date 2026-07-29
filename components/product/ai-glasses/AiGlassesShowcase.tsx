"use client";

import Link from "next/link";
import {
  BLEEQUUP_CREATOR_REVIEWS,
  BLEEQUUP_FEATURE_VIDEOS,
  BLEEQUUP_HERO,
  BLEEQUUP_PROMOS,
  BLEEQUUP_SETUP_VIDEO,
  BLEEQUUP_TESTIMONIALS,
} from "@/lib/content/bleequp-ai-glasses";
import { NativeVideoPlayer } from "./NativeVideoPlayer";
import { YouTubeVideoCard } from "./YouTubeVideoCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function AiGlassesHero({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "mb-10 overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/80 via-background to-muted/40 sm:mb-12",
        className,
      )}
    >
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-10 lg:p-10">
        <div className="space-y-5">
          <Badge variant="secondary" className="text-xs uppercase tracking-wider">
            Authorized BleeqUp retailer
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{BLEEQUUP_HERO.title}</h2>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {BLEEQUUP_HERO.subtitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {BLEEQUUP_PROMOS.map((promo) => (
              <div
                key={promo.label}
                className="rounded-lg border bg-background/80 px-3 py-2 text-left backdrop-blur"
              >
                <p className="text-sm font-medium">{promo.label}</p>
                <p className="text-xs text-muted-foreground">{promo.detail}</p>
              </div>
            ))}
          </div>
          <a href="#shop-ranger" className={cn(buttonVariants({ size: "lg" }), "mt-2")}>
            Shop Ranger models
          </a>
        </div>
        <NativeVideoPlayer
          src={BLEEQUUP_HERO.mp4}
          poster={BLEEQUUP_HERO.poster}
          title={BLEEQUUP_HERO.title}
          autoPlay
        />
      </div>
    </section>
  );
}

export function AiGlassesVideoGallery() {
  const site = useSite();
  const dict = useDictionary();
  return (
    <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
      <section aria-labelledby="features-heading">
        <SectionHeading
          eyebrow={dict.bleeq.home.featuresKicker}
          title={dict.bleeq.home.featuresTitle}
          description="Every clip below comes from the official BleeqUp site — stabilization, AI editing, FOV, and more."
        />
        <div className="mt-10 space-y-12">
          {BLEEQUUP_FEATURE_VIDEOS.map((video, index) => {
            const reversed = index % 2 === 1;
            return (
              <div
                key={video.id}
                className={`grid items-center gap-6 lg:grid-cols-2 lg:gap-10 ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <NativeVideoPlayer
                  src={video.mp4}
                  poster={video.poster}
                  title={video.title}
                />
                <div className="space-y-3">
                  {video.tag && (
                    <Badge variant="outline" className="text-xs uppercase tracking-wider">
                      {video.tag}
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Athlete testimonials */}
      <section aria-labelledby="testimonials-heading">
        <SectionHeading
          eyebrow="Real athletes"
          title={dict.bleeq.home.testimonialsTitle}
          description="Creators and athletes wearing Ranger in the field — first-person POV from the official BleeqUp community."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLEEQUUP_TESTIMONIALS.map((video) => (
            <article key={video.id} className="flex flex-col gap-3">
              <NativeVideoPlayer
                src={video.mp4}
                poster={video.poster}
                title={video.title}
                posterWidth={640}
              />
              <div>
                <h3 className="font-semibold">@{video.title}</h3>
                {video.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{video.description}&rdquo;
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Creator YouTube reviews */}
      <section aria-labelledby="creators-heading">
        <SectionHeading
          eyebrow="Trusted by creators"
          title="Independent reviews"
          description="YouTube creators putting the 4-in-1 Ranger through real-world tests."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {BLEEQUUP_CREATOR_REVIEWS.map((video) => (
            <YouTubeVideoCard
              key={video.youtubeId}
              youtubeId={video.youtubeId}
              title={video.name}
              quote={video.quote}
              poster={video.poster}
            />
          ))}
        </div>
      </section>

      {/* Setup */}
      <section
        aria-labelledby="setup-heading"
        className="overflow-hidden rounded-2xl border bg-muted/30 p-6 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            <SectionHeading
              eyebrow="Getting started"
              title={BLEEQUUP_SETUP_VIDEO.title}
              description={BLEEQUUP_SETUP_VIDEO.description}
            />
            <p className="text-center text-sm text-muted-foreground lg:text-left">
              Questions? See our{" "}
              <Link href="/faq" className="text-primary hover:underline">
                FAQ
              </Link>{" "}
              or email{" "}
              <a href={`mailto:${site.supportEmail}`} className="text-primary hover:underline">
                {site.supportEmail}
              </a>
              .
            </p>
          </div>
          <YouTubeVideoCard
            youtubeId={BLEEQUUP_SETUP_VIDEO.youtubeId}
            title={BLEEQUUP_SETUP_VIDEO.title}
            poster={`https://i.ytimg.com/vi/${BLEEQUUP_SETUP_VIDEO.youtubeId}/hqdefault.jpg`}
          />
        </div>
      </section>
    </div>
  );
}
