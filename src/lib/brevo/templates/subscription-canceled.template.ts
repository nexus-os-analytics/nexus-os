import { wrapEmail } from './_shared';

export default function subscriptionCanceledTemplate(name: string, link?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Sua assinatura foi cancelada.</p>
    <p>Se isso foi um engano ou você deseja revisar suas opções, acesse sua conta:</p>
  `;

  return wrapEmail({
    title: 'Assinatura cancelada',
    accentColor: '#A8872A',
    contentHtml,
    buttonLabel: 'Gerenciar conta',
    buttonHref: link,
  });
}
