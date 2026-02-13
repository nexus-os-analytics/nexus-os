import { wrapEmail } from './_shared';

export default function subscriptionTrialEndingTemplate(name: string, link?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Seu período de teste PRO está chegando ao fim em <strong>3 dias</strong>.</p>
    <p>Para continuar aproveitando todos os recursos premium sem interrupções:</p>
    <ul style="margin-left: 20px;">
      <li>Acesse sua conta</li>
      <li>Confirme seu método de pagamento</li>
      <li>A cobrança será processada automaticamente ao final do período</li>
    </ul>
    <p>Se você não deseja continuar com o plano PRO, pode cancelar a qualquer momento antes do fim do período de teste.</p>
    <p><strong>Recursos PRO que você continuará tendo acesso:</strong></p>
    <ul style="margin-left: 20px;">
      <li>✓ Alertas inteligentes de estoque</li>
      <li>✓ Integração completa com Bling ERP</li>
      <li>✓ Relatórios avançados</li>
      <li>✓ Suporte prioritário</li>
    </ul>
  `;

  return wrapEmail({
    title: 'Seu teste PRO termina em breve',
    accentColor: '#2B8A3E',
    contentHtml,
    buttonLabel: 'Gerenciar assinatura',
    buttonHref: link,
  });
}
