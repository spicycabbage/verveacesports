const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

export type BrevoSubscribeResult =
  | { ok: true; created: boolean }
  | { ok: false; error: string };

export type BrevoSubscribeOptions = {
  /** Storefront that collected the email — picks the Brevo list. */
  siteId: "verveace" | "bleeq-ca";
  /** UI / flow surface, e.g. popup | account-signup */
  source?: string;
  firstName?: string;
  lastName?: string;
};

function parseListId(raw: string | undefined): number | null {
  if (!raw?.trim()) return null;
  const listId = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(listId) ? listId : null;
}

/**
 * Two-list model:
 * - verveace → BREVO_LIST_ID
 * - bleeq-ca → BREVO_LIST_ID_BLEEQ_CA
 * No fallback between lists (keeps segments clean).
 */
export function getBrevoListId(siteId: BrevoSubscribeOptions["siteId"]): number | null {
  if (siteId === "bleeq-ca") {
    return parseListId(process.env.BREVO_LIST_ID_BLEEQ_CA);
  }
  return parseListId(process.env.BREVO_LIST_ID);
}

export function isBrevoConfigured(siteId: BrevoSubscribeOptions["siteId"] = "verveace"): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim() && getBrevoListId(siteId) !== null);
}

export async function subscribeToBrevoList(
  email: string,
  options: BrevoSubscribeOptions,
): Promise<BrevoSubscribeResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listId = getBrevoListId(options.siteId);

  if (!apiKey || listId === null) {
    return {
      ok: false,
      error:
        options.siteId === "bleeq-ca"
          ? "Newsletter is not configured (set BREVO_LIST_ID_BLEEQ_CA)"
          : "Newsletter is not configured (set BREVO_LIST_ID)",
    };
  }

  const attributes: Record<string, string> = {
    SITE_ID: options.siteId,
    STOREFRONT: options.siteId === "bleeq-ca" ? "BleeqUp Canada" : "VerveaceSports",
    SOURCE: options.source?.slice(0, 64) || "popup",
  };
  if (options.firstName?.trim()) attributes.FIRSTNAME = options.firstName.trim().slice(0, 80);
  if (options.lastName?.trim()) attributes.LASTNAME = options.lastName.trim().slice(0, 80);

  const response = await fetch(BREVO_CONTACTS_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes,
    }),
  });

  if (response.status === 201) {
    return { ok: true, created: true };
  }

  if (response.status === 204) {
    return { ok: true, created: false };
  }

  let message = "Could not subscribe right now";
  try {
    const body = (await response.json()) as { message?: string; code?: string };
    if (body.code === "duplicate_parameter") {
      return { ok: true, created: false };
    }
    if (typeof body.message === "string" && body.message.length > 0) {
      message = body.message;
    }
  } catch {
    // ignore parse errors
  }

  console.error("Brevo subscribe failed:", response.status, message);
  return { ok: false, error: message };
}
