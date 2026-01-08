import type { Metadata } from 'next';
import { Home } from '@/components/pages/Home';
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Home',
  description: APP_DESCRIPTION,
  openGraph: {
    title: `${APP_NAME} — Home`,
    description: APP_DESCRIPTION,
    url: '/',
  },
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <Home />;
}
