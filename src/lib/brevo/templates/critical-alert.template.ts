import { wrapEmail } from './_shared';

export default function criticalAlertTemplate(name: string, detailsLink?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Identificamos um alerta de risco <strong>CRÍTICO</strong> em um dos seus produtos.</p>
    <p>Recomendamos verificar imediatamente os detalhes no painel para tomar as ações sugeridas.</p>
    <p class="muted">Você está recebendo este e-mail porque seu produto atingiu o nível CRÍTICO de risco de ruptura.</p>
  `;

  return wrapEmail({
    title: 'Alerta CRÍTICO',
    accentColor: '#fa5252',
    contentHtml,
    buttonLabel: 'Ver detalhes no NexusOS',
    buttonHref: detailsLink,
  });
}
