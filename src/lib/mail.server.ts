import nodemailer, { type Transporter } from 'nodemailer'

let transport: Transporter | null | undefined

function getTransport() {
  if (transport !== undefined) return transport
  const url = process.env.SMTP_URL
  transport = url ? nodemailer.createTransport(url) : null
  return transport
}

export function notificationsEnabled() {
  return Boolean(process.env.SMTP_URL && process.env.NOTIFY_EMAIL)
}

// patient data never goes into the mail: plain email is not a safe channel for medical questions
export async function notifyNewMessage(subject: string, siteUrl: string) {
  const to = process.env.NOTIFY_EMAIL
  const mailer = getTransport()
  if (!to || !mailer) return
  const link = `${siteUrl}/beheer/berichten`
  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || to,
      to,
      subject: `Nieuw bericht via de website: ${subject}`,
      text: [
        'Er is een nieuw bericht binnengekomen via het contactformulier.',
        '',
        `Onderwerp: ${subject}`,
        '',
        `Lees en beantwoord het in beheer: ${link}`,
        '',
        'Om privacyredenen staat de inhoud niet in deze e-mail.',
      ].join('\n'),
    })
  } catch (err) {
    console.error('contact notification failed:', err instanceof Error ? err.message : err)
  }
}
