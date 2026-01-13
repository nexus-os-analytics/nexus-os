import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Condições de uso do Nexus OS: descrição do serviço, integrações, privacidade, responsabilidades e suporte.',
  openGraph: {
    title: `${APP_NAME} — Termos de Uso`,
    description:
      'Condições de uso do Nexus OS: descrição do serviço, integrações, privacidade, responsabilidades e suporte.',
    url: '/termos-de-uso',
  },
  alternates: { canonical: '/termos-de-uso' },
};

import { Terms } from '@/components/pages/Terms';

export default function TermsPage() {
  return <Terms />;
}
