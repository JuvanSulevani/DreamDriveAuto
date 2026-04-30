import nodemailer from 'nodemailer';

let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (transport) return transport;
  if (!process.env.SMTP_HOST) return null;
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined
  });
  return transport;
}

export async function notifyLead(subject: string, body: string) {
  const t = getTransport();
  if (!t) {
    console.log('[email] SMTP not configured — would send:', subject);
    return;
  }
  const to = process.env.LEADS_NOTIFY_TO;
  if (!to) return;
  await t.sendMail({
    from: process.env.SMTP_FROM || 'leads@dreamdriveauto.com',
    to,
    subject,
    text: body
  });
}
