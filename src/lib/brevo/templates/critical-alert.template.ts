export default function criticalAlertTemplate(name: string, detailsLink?: string) {
  return `
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Alerta CRÍTICO no NexusOS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
          Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #f8f9fa; margin: 0; padding: 40px 0; }
        .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px; }
        h1 { color: #fa5252; font-size: 22px; margin-bottom: 16px; }
        p { color: #343a40; font-size: 15px; line-height: 1.5; margin: 12px 0; }
        a.button { display: inline-block; background-color: #fa5252; color: white; text-decoration: none; font-weight: 500; padding: 12px 24px; border-radius: 8px; margin-top: 20px; transition: background-color 0.2s ease; }
        a.button:hover { background-color: #e03131; }
        .muted { color: #868e96; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Alerta CRÍTICO</h1>
        <p>Olá <strong>${name}</strong>,</p>
        <p>Identificamos um alerta de risco <strong>CRÍTICO</strong> em um dos seus produtos.</p>
        <p>Recomendamos verificar imediatamente os detalhes no painel para tomar as ações sugeridas.</p>
        <a href="${detailsLink}" class="button" target="_blank" rel="noopener">Ver detalhes no NexusOS</a>
        <p class="muted">Você está recebendo este e-mail porque seu produto atingiu o nível CRÍTICO de risco de ruptura.</p>
      </div>
    </body>
  </html>
`;
}
