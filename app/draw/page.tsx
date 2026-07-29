import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DrawSignupForm } from "@/components/draw/DrawSignupForm";
import { getSite } from "@/lib/site/get-site";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const site = await getSite();
  if (site.id !== "bleeq-ca") return { title: "Draw" };
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return {
    title: dict.draw.title,
    description: dict.draw.metaDescription,
    alternates: { canonical: "/draw" },
  };
}

export default async function DrawPage() {
  const site = await getSite();
  if (site.id !== "bleeq-ca") notFound();

  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const d = dict.draw;

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-black text-white">
        <div className="relative mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative h-[185px] overflow-hidden sm:h-auto sm:min-h-[280px] lg:min-h-[420px]">
            <Image
              src="/bleeq-newsletter-nbda.webp"
              alt="Meet BleeqUp at NBDA Canada 2026"
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={82}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/40" />
          </div>

          <div className="relative flex flex-col justify-end px-4 py-10 sm:px-8 sm:py-14 lg:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {d.kicker}
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {d.headline}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
              {d.subhead}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md rounded-xl border border-border bg-card/50 p-5 sm:p-6">
          <h2 className="text-center text-lg font-semibold tracking-tight sm:text-xl">
            {d.formTitle}
          </h2>
          <p className="mt-1.5 text-center text-sm text-muted-foreground">
            {d.formSubtitle}
          </p>
          <div className="mt-5">
            <DrawSignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
