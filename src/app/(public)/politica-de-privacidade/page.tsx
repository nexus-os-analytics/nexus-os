import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Política de privacidade do Nexus OS: coleta, uso, proteção de dados e direitos dos titulares.',
  openGraph: {
    title: `${APP_NAME} — Política de Privacidade`,
    description:
      'Política de privacidade do Nexus OS: coleta, uso, proteção de dados e direitos dos titulares.',
    url: '/politica-de-privacidade',
  },
  alternates: { canonical: '/politica-de-privacidade' },
};

import PrivacyPolicy from '@/components/pages/PrivacyPolicy';

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
