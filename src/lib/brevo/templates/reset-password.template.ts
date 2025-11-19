export default (name: string, resetLink?: string) => `
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Redefinição de senha</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #f8f9fa;
          margin: 0;
          padding: 40px 0;
        }

        .container {
          max-width: 480px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 32px;
          text-align: center;
        }

        h1 {
          color: #339af0;
          font-size: 22px;
          margin-bottom: 16px;
        }

        p {
          color: #343a40;
          font-size: 15px;
          line-height: 1.5;
          margin: 12px 0;
        }

        a.button {
          display: inline-block;
          background-color: #339af0;
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 12px 24px;
          border-radius: 8px;
          margin-top: 20px;
          transition: background-color 0.2s ease;
        }

        a.button:hover {
          background-color: #1c7ed6;
        }

        .footer {
          font-size: 13px;
          color: #868e96;
          margin-top: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Redefinição de senha</h1>
        <p>Olá <strong>${name}</strong>,</p>
        <p>
          Recebemos uma solicitação para redefinir sua senha. 
          Clique no botão abaixo para criar uma nova senha:
        </p>
        <a href="${resetLink}" class="button" target="_blank">Redefinir senha</a>
        <p class="footer">
          Se você não solicitou esta ação, pode ignorar este e-mail com segurança.
        </p>
      </div>
    </body>
  </html>
`;
