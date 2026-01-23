import { wrapEmail } from './_shared';

export default function resetPasswordTemplate(name: string, link?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Recebemos uma solicitação para redefinir sua senha.</p>
    <p>Clique no botão abaixo para criar uma nova senha:</p>
    <p class="muted">Se você não solicitou esta ação, pode ignorar este e-mail com segurança.</p>
  `;

  return wrapEmail({
    title: 'Redefinição de senha',
    accentColor: '#A8872A',
    contentHtml,
    buttonLabel: 'Redefinir senha',
    buttonHref: link,
  });
}
