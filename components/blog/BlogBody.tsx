import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { blogPath } from "@/lib/content/blog/paths";
import type { BlogBlock } from "@/lib/content/blog";

const INLINE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
const LINK_CLASS = "font-medium text-primary underline-offset-4 hover:underline";

function productSlugFromHref(href: string): string | null {
  const match = /^\/products\/([^/?#]+)$/.exec(href);
  return match?.[1] ?? null;
}

function localizeHref(href: string, locale: Locale): string {
  if (href === "/blog" || href.startsWith("/blog/") || href.startsWith("/blog#")) {
    const suffix = href.slice("/blog".length);
    return blogPath(locale, suffix);
  }
  return href;
}

function renderLink(
  label: string,
  href: string,
  key: number,
  activeProducts: ReadonlySet<string>,
  locale: Locale,
) {
  const localized = localizeHref(href, locale);
  const productSlug = productSlugFromHref(localized);
  if (productSlug && !activeProducts.has(productSlug)) return <span key={key}>{label}</span>;
  if (localized.startsWith("/")) {
    return (
      <Link key={key} href={localized} className={LINK_CLASS}>
        {label}
      </Link>
    );
  }
  if (localized.startsWith("#")) {
    return (
      <a key={key} href={localized} className={LINK_CLASS}>
        {label}
      </a>
    );
  }
  return (
    <a key={key} href={href} className={LINK_CLASS} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function Inline({
  text,
  activeProducts,
  locale,
}: {
  text: string;
  activeProducts: ReadonlySet<string>;
  locale: Locale;
}) {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE)) {
    const index = m.index ?? 0;
    if (index > last) out.push(text.slice(last, index));
    if (m[1] && m[2]) {
      out.push(renderLink(m[1], m[2], key++, activeProducts, locale));
    } else if (m[3]) {
      out.push(
        <strong key={key++} className="font-semibold text-foreground">
          {m[3]}
        </strong>,
      );
    }
    last = index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

function Block({
  block,
  activeProducts,
  locale,
  sectionId,
}: {
  block: BlogBlock;
  activeProducts: ReadonlySet<string>;
  locale: Locale;
  sectionId?: string;
}) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          id={sectionId}
          className="scroll-mt-32 pt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="scroll-mt-32 text-lg font-semibold text-foreground">{block.text}</h3>
      );
    case "p":
      return (
        <p>
          <Inline text={block.text} activeProducts={activeProducts} locale={locale} />
        </p>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-5">
          {block.items.map((item) => (
            <li key={item}>
              <Inline text={item} activeProducts={activeProducts} locale={locale} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-5">
          {block.items.map((item) => (
            <li key={item}>
              <Inline text={item} activeProducts={activeProducts} locale={locale} />
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">{block.caption}</caption>
            <thead className="bg-muted/50 text-foreground">
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col" className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) =>
                    c === 0 ? (
                      <th key={c} scope="row" className="px-3 py-2 font-medium text-foreground">
                        <Inline text={cell} activeProducts={activeProducts} locale={locale} />
                      </th>
                    ) : (
                      <td key={c} className="px-3 py-2">
                        <Inline text={cell} activeProducts={activeProducts} locale={locale} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <aside className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-foreground">
          <Inline text={block.text} activeProducts={activeProducts} locale={locale} />
        </aside>
      );
    case "image":
      return (
        <figure>
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-xl"
          />
          {block.caption ? (
            <figcaption className="mt-2 text-center text-xs">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

export function BlogBody({
  blocks,
  activeProducts,
  locale = DEFAULT_LOCALE,
}: {
  blocks: readonly BlogBlock[];
  activeProducts: ReadonlySet<string>;
  locale?: Locale;
}) {
  let section = 0;
  return (
    <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
      {blocks.map((block, i) => (
        <Block
          key={i}
          block={block}
          activeProducts={activeProducts}
          locale={locale}
          sectionId={block.type === "h2" ? `s-${++section}` : undefined}
        />
      ))}
    </div>
  );
}
