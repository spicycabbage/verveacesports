export const NEWSLETTER_SUBSCRIBED_KEY = "verveacesports_newsletter_subscribed_v1";
export const NEWSLETTER_DISMISSED_KEY = "verveacesports_newsletter_dismissed_v1";

export function shouldShowNewsletterPopup(): boolean {
  if (typeof window === "undefined") return false;
  return (
    !localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY) &&
    !localStorage.getItem(NEWSLETTER_DISMISSED_KEY)
  );
}

export function markNewsletterSubscribed() {
  localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, "1");
  localStorage.removeItem(NEWSLETTER_DISMISSED_KEY);
}

export function markNewsletterDismissed() {
  localStorage.setItem(NEWSLETTER_DISMISSED_KEY, "1");
}
