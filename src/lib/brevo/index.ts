import axios, { isAxiosError } from 'axios';
import inviteTemplate from './templates/invite-user.template';
import resetPasswordTemplate from './templates/reset-password.template';
import welcomeTemplate from './templates/welcome.template';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;

const emailTemplates = {
  welcome: welcomeTemplate,
  resetPassword: resetPasswordTemplate,
  inviteUser: inviteTemplate,
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
    subject: subject,
    htmlContent: emailTemplates[templateName](toName, link),
  };

  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    if (isAxiosError(error)) {
      throw new Error(`Brevo API error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}
