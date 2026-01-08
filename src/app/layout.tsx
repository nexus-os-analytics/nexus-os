import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { APP_DESCRIPTION, APP_HOMEPAGE_URL, APP_LANGUAGE, APP_NAME } from '@/lib/constants';
import { Providers } from '@/providers';

export const metadata = {
  metadataBase: new URL(APP_HOMEPAGE_URL),
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: '/',
    siteName: APP_NAME,
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/img/logo.png',
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — ${APP_DESCRIPTION}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/img/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: { url: '/icon.svg', type: 'image/svg+xml' },
  },
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={APP_LANGUAGE} {...mantineHtmlProps}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
