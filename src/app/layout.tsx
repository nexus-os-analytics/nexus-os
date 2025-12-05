import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Providers } from '@/providers';

export const metadata = {
  title: 'Next.js Base',
  description: 'A base project for Next.js applications with authentication and Mantine UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="32x32" />
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
