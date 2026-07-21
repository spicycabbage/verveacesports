import { cn } from "@/lib/utils";
import type { FaqSection } from "@/lib/content/faq";

export function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">{section.title}</h2>
          <div className="divide-y rounded-xl border bg-card">
            {section.items.map((item) => (
              <details key={item.question} className="group">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 text-sm font-medium",
                    "hover:bg-muted/40 [&::-webkit-details-marker]:hidden",
                  )}
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
