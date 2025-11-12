import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { google } from 'googleapis';

@Controller('auth/gmail')
export class GmailAuthController {
  private readonly logger = new Logger(GmailAuthController.name);
  private oauth2Client: any;

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2({
      clientId: this.configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.configService.get('GOOGLE_REDIRECT_URI'),
    });
  }

  /**
   * Inicia el flujo de autenticación OAuth2 para Gmail
   * Visita: http://localhost:3000/auth/gmail para empezar
   */
  @Get()
  initiateAuth(@Res() res: Response) {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Fuerza mostrar pantalla de consentimiento
    });

    this.logger.log('Redirecting to Gmail OAuth consent screen');
    res.redirect(authUrl);
  }

  /**
   * Maneja el callback de Google OAuth2
   * Este endpoint recibe el código de autorización y lo intercambia por tokens
   */
  @Get('callback')
  async handleCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      this.logger.error('No authorization code received');
      return res.status(400).send(`
        <h1>❌ Error</h1>
        <p>No se recibió código de autorización de Google.</p>
        <a href="/auth/gmail">Intentar de nuevo</a>
      `);
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      this.logger.log('✅ Tokens obtained successfully');
      this.logger.log(`Refresh Token: ${tokens.refresh_token}`);
      this.logger.log(`Access Token: ${tokens.access_token}`);

      // HTML response con los tokens para copiar
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Gmail API - Tokens Obtenidos</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; }
            .token-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .token { font-family: monospace; word-break: break-all; background: #e9ecef; padding: 5px; }
            .copy-btn { background: #007bff; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ ¡Gmail API Configurado Exitosamente!</h1>
            <p>Los tokens han sido generados. Copia los siguientes valores a tu archivo <code>.env</code>:</p>
          </div>

          <div class="token-box">
            <h3>🔑 Refresh Token (OBLIGATORIO)</h3>
            <p>Copia este valor a <code>GOOGLE_REFRESH_TOKEN</code> en tu .env:</p>
            <div class="token" id="refreshToken">${tokens.refresh_token}</div>
            <button class="copy-btn" onclick="copyToClipboard('refreshToken')">Copiar</button>
          </div>

          ${
            tokens.access_token
              ? `
          <div class="token-box">
            <h3>🎫 Access Token (OPCIONAL)</h3>
            <p>Este token expira en 1 hora, pero no es necesario copiarlo si tienes el refresh token:</p>
            <div class="token" id="accessToken">${tokens.access_token}</div>
            <button class="copy-btn" onclick="copyToClipboard('accessToken')">Copiar</button>
          </div>
          `
              : ''
          }

          <div class="token-box">
            <h3>📝 Instrucciones</h3>
            <ol>
              <li>Copia el <strong>Refresh Token</strong> de arriba</li>
              <li>Pégalo en tu archivo <code>.env</code> como <code>GOOGLE_REFRESH_TOKEN=tu_token_aqui</code></li>
              <li>Reinicia tu servidor: <code>npm run start:dev</code></li>
              <li>¡Ya puedes enviar emails con Gmail API!</li>
            </ol>
          </div>

          <script>
            function copyToClipboard(elementId) {
              const element = document.getElementById(elementId);
              const text = element.textContent;
              navigator.clipboard.writeText(text).then(() => {
                alert('¡Token copiado al portapapeles!');
              });
            }
          </script>
        </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens:', error);
      res.status(500).send(`
        <h1>❌ Error</h1>
        <p>Error al obtener tokens de Google: ${error.message}</p>
        <a href="/auth/gmail">Intentar de nuevo</a>
      `);
    }
  }

  /**
   * Endpoint para verificar si la configuración actual funciona
   */
  @Get('verify')
  async verifyConfiguration(@Res() res: Response) {
    try {
      const refreshToken = this.configService.get('GOOGLE_REFRESH_TOKEN');

      if (!refreshToken) {
        return res.status(400).send(`
          <h1>⚠️ Configuración Incompleta</h1>
          <p>No se encontró GOOGLE_REFRESH_TOKEN en las variables de entorno.</p>
          <p><a href="/auth/gmail">Configurar Gmail API</a></p>
        `);
      }

      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });

      res.send(`
        <h1>✅ Configuración Verificada</h1>
        <p><strong>Email configurado:</strong> ${profile.data.emailAddress}</p>
        <p><strong>Total de mensajes:</strong> ${profile.data.messagesTotal}</p>
        <p>¡La configuración de Gmail API está funcionando correctamente!</p>
      `);
    } catch (error) {
      this.logger.error('Gmail verification failed:', error);
      res.status(500).send(`
        <h1>❌ Error de Verificación</h1>
        <p>Error: ${error.message}</p>
        <p>Asegúrate de que tu GOOGLE_REFRESH_TOKEN sea válido.</p>
        <p><a href="/auth/gmail">Reconfigurar Gmail API</a></p>
      `);
    }
  }
}
