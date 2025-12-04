export default function inviteUserTemplate(name: string, inviteLink?: string) {
  return `
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Convite para NexusOS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
          Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #f8f9fa; margin: 0; padding: 40px 0; }
        .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px; text-align: center; }
        h1 { color: #12b886; font-size: 22px; margin-bottom: 16px; }
        p { color: #343a40; font-size: 15px; line-height: 1.5; margin: 12px 0; }
        a.button { display: inline-block; background-color: #12b886; color: white; text-decoration: none; font-weight: 500; padding: 12px 24px; border-radius: 8px; margin-top: 20px; transition: background-color 0.2s ease; }
        a.button:hover { background-color: #0ca678; }
        .footer { font-size: 13px; color: #868e96; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Você foi convidado para o NexusOS</h1>
        <p>Olá <strong>${name}</strong>,</p>
        <p>Você recebeu um convite para criar sua conta e acessar a plataforma.</p>
        <p>Clique abaixo para aceitar o convite e finalizar seu cadastro:</p>
        <a href="${inviteLink}" class="button" target="_blank">Aceitar convite</a>
        <p class="footer">Este link expira em breve. Se você não esperava este convite, ignore este e-mail.</p>
      </div>
    </body>
  </html>
`;
}
