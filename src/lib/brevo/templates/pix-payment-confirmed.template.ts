import { wrapEmail } from './_shared';

export default function pixPaymentConfirmedTemplate(name: string, link?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Seu pagamento via PIX foi confirmado pela nossa equipe. Sua assinatura PRO está ativa.</p>
    <p>Acesse o painel para aproveitar todos os recursos premium:</p>
  `;

  return wrapEmail({
    title: 'Pagamento PIX confirmado',
    accentColor: '#2E7D32',
    contentHtml,
    buttonLabel: 'Acessar painel',
    buttonHref: link,
  });
}
