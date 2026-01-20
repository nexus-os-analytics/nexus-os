import { sendEmail } from '@/lib/brevo';

interface SendWelcomeParams {
  email: string;
  name?: string | null;
  activationLink: string;
}

export async function sendWelcomeActivationEmail({
  email,
  name,
  activationLink,
}: SendWelcomeParams): Promise<void> {
  const subject = 'Bem-vindo ao Nexus OS — Ative sua conta';
  await sendEmail({
    toEmail: email,
    toName: name || 'Cliente',
    subject,
    link: activationLink,
    templateName: 'welcome',
  });
}
