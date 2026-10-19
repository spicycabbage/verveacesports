import type { ReactNode } from "react";

export function VoltArticle({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {intro ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </article>
  );
}
