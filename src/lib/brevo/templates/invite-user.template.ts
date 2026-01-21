import { wrapEmail } from './_shared';

export default function inviteUserTemplate(name: string, link?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Você recebeu um convite para criar sua conta e acessar a plataforma.</p>
    <p>Clique abaixo para aceitar o convite e finalizar seu cadastro:</p>
    <p class="muted">Este link expira em breve. Se você não esperava este convite, ignore este e-mail.</p>
  `;

  return wrapEmail({
    title: 'Você foi convidado para o Nexus OS',
    accentColor: '#A8872A',
    contentHtml,
    buttonLabel: 'Aceitar convite',
    buttonHref: link,
  });
}
