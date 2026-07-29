import Link from "next/link";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";

type Section = { title: string; body: string[] };

export async function LegalPage({
  title,
  updated,
  intro,
  sections,
  supportEmail,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
  supportEmail: string;
}) {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {dict.legal.home}
        </Link>
        {" / "}
        <span>{title}</span>
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {interpolate(dict.legal.lastUpdated, { date: updated })}
      </p>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{intro}</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {s.body.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted-foreground">
        {dict.legal.questionsEmail}{" "}
        <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
          {supportEmail}
        </a>
        .
      </p>
    </div>
  );
}
