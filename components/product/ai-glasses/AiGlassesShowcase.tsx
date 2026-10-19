"use client";

import Link from "next/link";
import {
  BLEEQUUP_CREATOR_REVIEWS,
  BLEEQUUP_FEATURE_VIDEOS,
  BLEEQUUP_HERO,
  BLEEQUUP_SETUP_VIDEO,
  BLEEQUUP_TESTIMONIALS,
} from "@/lib/content/bleequp-ai-glasses";
import { NativeVideoPlayer } from "./NativeVideoPlayer";
import { YouTubeVideoCard } from "./YouTubeVideoCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary, useLocale } from "@/lib/i18n/I18nProvider";
import {
  bleequpCreatorQuote,
  bleequpHero,
  bleequpPromos,
  bleequpSetup,
  bleequpVideoText,
} from "@/lib/i18n/bleequp-copy";
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
  const dict = useDictionary();
  const locale = useLocale();
  const hero = bleequpHero(locale);
  const promos = bleequpPromos(locale);
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
            {dict.bleeq.showcase.authorizedRetailer}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{hero.title}</h2>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {promos.map((promo) => (
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
            {dict.bleeq.showcase.shopModels}
          </a>
        </div>
        <NativeVideoPlayer
          src={BLEEQUUP_HERO.mp4}
          poster={BLEEQUUP_HERO.poster}
          title={hero.title}
          autoPlay
        />
      </div>
    </section>
  );
}

export function AiGlassesVideoGallery() {
  const site = useSite();
  const dict = useDictionary();
  const locale = useLocale();
  const setup = bleequpSetup(locale);
  return (
    <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
      <section aria-labelledby="features-heading">
        <SectionHeading
          eyebrow={dict.bleeq.home.featuresKicker}
          title={dict.bleeq.home.featuresTitle}
          description={dict.bleeq.showcase.featuresDesc}
        />
        <div className="mt-10 space-y-12">
          {BLEEQUUP_FEATURE_VIDEOS.map((video, index) => {
            const reversed = index % 2 === 1;
            const copy = bleequpVideoText(locale, video.id);
            return (
              <div
                key={video.id}
                className={`grid items-center gap-6 lg:grid-cols-2 lg:gap-10 ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <NativeVideoPlayer
                  src={video.mp4}
                  poster={video.poster}
                  title={copy?.title ?? video.title}
                />
                <div className="space-y-3">
                  {copy?.tag && (
                    <Badge variant="outline" className="text-xs uppercase tracking-wider">
                      {copy.tag}
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {copy?.title ?? video.title}
                  </h3>
                  {copy?.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {copy.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="testimonials-heading">
        <SectionHeading
          eyebrow={dict.bleeq.showcase.realAthletes}
          title={dict.bleeq.home.testimonialsTitle}
          description={dict.bleeq.showcase.testimonialsDesc}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLEEQUUP_TESTIMONIALS.map((video) => {
            const copy = bleequpVideoText(locale, video.id);
            return (
              <article key={video.id} className="flex flex-col gap-3">
                <NativeVideoPlayer
                  src={video.mp4}
                  poster={video.poster}
                  title={copy?.title ?? video.title}
                  posterWidth={640}
                />
                <div>
                  <h3 className="font-semibold">@{video.title}</h3>
                  {copy?.description && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{copy.description}&rdquo;
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="creators-heading">
        <SectionHeading
          eyebrow={dict.bleeq.showcase.trustedByCreators}
          title={dict.bleeq.showcase.independentReviews}
          description={dict.bleeq.showcase.creatorsDesc}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {BLEEQUUP_CREATOR_REVIEWS.map((video) => (
            <YouTubeVideoCard
              key={video.youtubeId}
              youtubeId={video.youtubeId}
              title={video.name}
              quote={bleequpCreatorQuote(locale, video.youtubeId, video.quote)}
              poster={video.poster}
            />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="setup-heading"
        className="overflow-hidden rounded-2xl border bg-muted/30 p-6 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            <SectionHeading
              eyebrow={dict.bleeq.showcase.gettingStarted}
              title={setup.title}
              description={setup.description}
            />
            <p className="text-center text-sm text-muted-foreground lg:text-left">
              {dict.bleeq.showcase.questionsFaq}{" "}
              <Link href="/faq" className="text-primary hover:underline">
                {dict.nav.faq}
              </Link>{" "}
              {dict.bleeq.showcase.orEmail}{" "}
              <a href={`mailto:${site.supportEmail}`} className="text-primary hover:underline">
                {site.supportEmail}
              </a>
              .
            </p>
          </div>
          <YouTubeVideoCard
            youtubeId={BLEEQUUP_SETUP_VIDEO.youtubeId}
            title={setup.title}
            poster={`https://i.ytimg.com/vi/${BLEEQUUP_SETUP_VIDEO.youtubeId}/hqdefault.jpg`}
          />
        </div>
      </section>
    </div>
  );
}
