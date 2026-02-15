import pino from 'pino';
import criticalAlertTemplate from './templates/critical-alert.template';
import inviteTemplate from './templates/invite-user.template';
import paymentConfirmedTemplate from './templates/payment-confirmed.template';
import paymentFailedTemplate from './templates/payment-failed.template';
import resetPasswordTemplate from './templates/reset-password.template';
import subscriptionCanceledTemplate from './templates/subscription-canceled.template';
import subscriptionTrialEndingTemplate from './templates/subscription-trial-ending.template';
import welcomeTemplate from './templates/welcome.template';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const logger = pino();

const emailTemplates = {
  welcome: welcomeTemplate,
  resetPassword: resetPasswordTemplate,
  inviteUser: inviteTemplate,
  criticalAlert: criticalAlertTemplate,
  paymentConfirmed: paymentConfirmedTemplate,
  subscriptionCanceled: subscriptionCanceledTemplate,
  paymentFailed: paymentFailedTemplate,
  subscriptionTrialEnding: subscriptionTrialEndingTemplate,
};

interface BrevoErrorResponse {
  code?: string;
  message?: string;
}

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
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as BrevoErrorResponse;
      const errorMessage = errorData.message || `HTTP ${response.status} ${response.statusText}`;

      logger.error({
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        toEmail,
        subject,
      }, 'Failed to send email via Brevo');

      throw new Error(`Brevo API error: ${errorMessage}`);
    }

    const result = await response.json();
    logger.info({
      messageId: result.messageId,
      toEmail,
      subject,
    }, 'Email sent successfully via Brevo');

    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Brevo API error')) {
      throw error;
    }

    logger.error({ error, toEmail, subject }, 'Failed to send email via Brevo');
    throw new Error(`Brevo API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
