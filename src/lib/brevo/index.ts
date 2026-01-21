import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import pino from 'pino';
import criticalAlertTemplate from './templates/critical-alert.template';
import inviteTemplate from './templates/invite-user.template';
import resetPasswordTemplate from './templates/reset-password.template';
import welcomeTemplate from './templates/welcome.template';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const logger = pino();

const emailTemplates = {
  welcome: welcomeTemplate,
  resetPassword: resetPasswordTemplate,
  inviteUser: inviteTemplate,
  criticalAlert: criticalAlertTemplate,
  // Pagamento confirmado
  // Assinatura cancelada
};

export async function sendEmail({
  toEmail,
  toName,
  subject,
  link,
  templateName,
}: {
  toEmail: string;
  toName: string;
  subject: string;
  link?: string;
  templateName: keyof typeof emailTemplates;
}) {
  if (!BREVO_API_KEY || !BREVO_SENDER_NAME || !BREVO_SENDER_EMAIL) {
    throw new Error('Brevo environment variables are not set properly.');
  }

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL,
    },
    to: [
      {
        email: toEmail,
        name: toName,
      },
    ],
    subject,
    htmlContent: emailTemplates[templateName](toName, link),
  };

  try {
    const api = new TransactionalEmailsApi();
    api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
    await api.sendTransacEmail(emailData);
  } catch (error) {
    const err = error as { body?: unknown; message?: string };
    const details = typeof err.body === 'string' ? err.body : JSON.stringify(err.body);
    logger.error(`Failed to send email via Brevo: ${error}`);
    throw new Error(
      `Brevo API error: ${err.message ?? 'Unknown error'}${details ? ` - ${details}` : ''}`
    );
  }
}
