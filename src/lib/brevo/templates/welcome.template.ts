import { wrapEmail } from './_shared';

export default function welcomeTemplate(name: string, activateLink?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Estamos felizes em ter você conosco. Ative sua conta para começar a usar o Nexus OS.</p>
  `;

  return wrapEmail({
    title: 'Bem-vindo ao Nexus OS',
    accentColor: '#A8872A',
    contentHtml,
    buttonLabel: 'Ativar conta',
    buttonHref: activateLink,
  });
}
