interface MailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envia e-mail via Resend se RESEND_API_KEY estiver definida.
 * Em dev (sem chave) apenas loga no console para nao bloquear o fluxo.
 */
export async function sendMail({ to, subject, html }: MailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "no-reply@school.local";

  if (!apiKey) {
    console.info(`[email:dev] Para: ${to} | Assunto: ${subject}\n${html}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao enviar e-mail: ${res.status}`);
  }
}
