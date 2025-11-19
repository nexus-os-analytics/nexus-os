export default (name: string, activateLink?: string) => `
  <html>
    <body>
      <h1>Welcome ${name}!</h1>
      <p>We're excited to have you on board. Please activate your account using the link below:</p>
      <a href="${activateLink}">Activate Account</a>
    </body>
  </html>
`;
