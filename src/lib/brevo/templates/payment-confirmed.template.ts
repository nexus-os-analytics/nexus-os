import { wrapEmail } from './_shared';

export default function paymentConfirmedTemplate(name: string, link?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Recebemos a confirmação do seu pagamento. Sua assinatura está ativa.</p>
    <p>Você pode ver os detalhes do pedido e fatura no painel:</p>
  `;

  return wrapEmail({
    title: 'Pagamento confirmado',
    accentColor: '#A8872A',
    contentHtml,
    buttonLabel: 'Ver detalhes',
    buttonHref: link,
  });
}
