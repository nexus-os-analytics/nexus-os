import { wrapEmail } from './_shared';

export default function pixPaymentRejectedTemplate(name: string, link?: string) {
  const contentHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Infelizmente não foi possível confirmar seu pagamento via PIX. Pode ter havido divergência nos dados ou no comprovante enviado.</p>
    <p>Se você já realizou o pagamento, entre em contato conosco com o comprovante para que possamos reanalisar.</p>
  `;

  return wrapEmail({
    title: 'Pagamento PIX não confirmado',
    accentColor: '#C62828',
    contentHtml,
    buttonLabel: link ? 'Falar com suporte' : undefined,
    buttonHref: link,
  });
}
