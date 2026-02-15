import { wrapEmail } from './_shared';

export default function paymentFailedTemplate(name: string, link?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Não conseguimos processar o pagamento da sua assinatura PRO.</p>
    <p>Para continuar aproveitando todos os recursos premium, atualize seu método de pagamento:</p>
    <p><strong>O que fazer:</strong></p>
    <ul style="margin-left: 20px;">
      <li>Verifique se há saldo suficiente no cartão</li>
      <li>Confirme os dados do cartão</li>
      <li>Atualize o método de pagamento se necessário</li>
    </ul>
    <p>Se o pagamento não for processado em breve, sua conta será automaticamente alterada para o plano gratuito.</p>
  `;

  return wrapEmail({
    title: 'Falha no pagamento',
    accentColor: '#E03131',
    contentHtml,
    buttonLabel: 'Atualizar pagamento',
    buttonHref: link,
  });
}
