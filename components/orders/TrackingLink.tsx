import { resolveTrackingUrl } from "@/lib/shipping/carriers";

export function TrackingLink({
  company,
  trackingNumber,
  trackingUrl,
}: {
  company?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  if (!trackingNumber) return null;
  const href = resolveTrackingUrl({ company, trackingNumber, trackingUrl });
  const label = company ? `${company} ${trackingNumber}` : trackingNumber;
  if (!href) return <span>{label}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
      {label}
    </a>
  );
}
