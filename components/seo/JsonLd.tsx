type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Renders a schema.org JSON-LD script tag. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so user-provided strings can't break out of the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
