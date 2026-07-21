const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

export type BrevoSubscribeResult =
  | { ok: true; created: boolean }
  | { ok: false; error: string };

function getBrevoListId(): number | null {
  const raw = process.env.BREVO_LIST_ID?.trim();
  if (!raw) return null;
  const listId = Number.parseInt(raw, 10);
  return Number.isFinite(listId) ? listId : null;
}

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim() && getBrevoListId());
}

export async function subscribeToBrevoList(email: string): Promise<BrevoSubscribeResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listId = getBrevoListId();

  if (!apiKey || listId === null) {
    return { ok: false, error: "Newsletter is not configured" };
  }

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
