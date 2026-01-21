export interface WrapEmailOptions {
  title: string;
  accentColor: string;
  contentHtml: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export function wrapEmail({
  title,
  accentColor,
  contentHtml,
  buttonLabel,
  buttonHref,
}: WrapEmailOptions): string {
  return `
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #f8f9fa;
          margin: 0;
          padding: 40px 0;
        }

        .container {
          max-width: 520px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 32px;
        }

        .brand {
          color: #868e96;
          font-size: 13px;
          margin-bottom: 8px;
        }

        h1 {
          color: ${accentColor};
          font-size: 22px;
          margin: 0 0 16px;
        }

        p {
          color: #343a40;
          font-size: 15px;
          line-height: 1.5;
          margin: 12px 0;
        }

        a.button {
          display: inline-block;
          background-color: ${accentColor};
          color: #ffffff;
          text-decoration: none;
          font-weight: 500;
          padding: 12px 24px;
          border-radius: 8px;
          margin-top: 20px;
          transition: filter 0.2s ease;
        }

        a.button:hover { filter: brightness(0.92); }

        .muted { color: #868e96; font-size: 13px; }
        .content { margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">Nexus OS</div>
        <h1>${title}</h1>
        <div class="content">
          ${contentHtml}
        </div>
        ${buttonLabel && buttonHref ? `<a href="${buttonHref}" class="button" target="_blank" rel="noopener">${buttonLabel}</a>` : ''}
      </div>
    </body>
  </html>
  `;
}
