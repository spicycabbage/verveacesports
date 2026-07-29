const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";

export type BrevoSender = {
  name: string;
  email: string;
};

export type BrevoSendInput = {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
  sender: BrevoSender;
};

export type BrevoSendResult = { ok: true; messageId?: string } | { ok: false; error: string };

export function isBrevoTransactionalConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

/**
 * Send a transactional email via Brevo SMTP API.
 * Never throws — callers should not fail auth/payment on email errors.
 */
export async function sendBrevoEmail(input: BrevoSendInput): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "BREVO_API_KEY is not set" };
  }

  const toEmail = input.to.email.trim().toLowerCase();
  if (!toEmail) {
    return { ok: false, error: "Missing recipient email" };
  }

  try {
    const response = await fetch(BREVO_SMTP_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: input.sender.name,
          email: input.sender.email,
        },
        to: [
          {
            email: toEmail,
            ...(input.to.name?.trim() ? { name: input.to.name.trim() } : {}),
          },
        ],
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,
      }),
    });

    if (response.ok) {
      let messageId: string | undefined;
      try {
        const body = (await response.json()) as { messageId?: string };
        messageId = body.messageId;
      } catch {
        // ignore empty body
      }
      return { ok: true, messageId };
    }

    let message = `Brevo send failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (typeof body.message === "string" && body.message.length > 0) {
        message = body.message;
      }
    } catch {
      // ignore parse errors
    }
    console.error("Brevo transactional send failed:", response.status, message);
    return { ok: false, error: message };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Brevo send threw";
    console.error("Brevo transactional send threw:", message);
    return { ok: false, error: message };
  }
}
