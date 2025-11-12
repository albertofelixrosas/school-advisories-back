import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private oauth2Client: OAuth2Client;
  private gmail: any;

  constructor(private configService: ConfigService) {
    this.initializeGmailAPI();
  }

  private initializeGmailAPI() {
    try {
      this.oauth2Client = new google.auth.OAuth2(
        this.configService.get('GOOGLE_CLIENT_ID'),
        this.configService.get('GOOGLE_CLIENT_SECRET'),
        this.configService.get('GOOGLE_REDIRECT_URI'),
      );

      this.oauth2Client.setCredentials({
        refresh_token: this.configService.get('GOOGLE_REFRESH_TOKEN'),
      });

      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      this.logger.log('Gmail API service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Gmail API:', error);
      throw error;
    }
  }

  private createEmailMessage(options: EmailOptions): string {
    const fromEmail = this.configService.get('FROM_EMAIL');
    const fromName =
      this.configService.get('FROM_NAME') || 'Sistema de Asesorías';

    const emailLines = [
      `To: ${options.to}`,
      `From: "${fromName}" <${fromEmail}>`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      options.html,
    ];

    return emailLines.join('\r\n');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const emailMessage = this.createEmailMessage(options);
      const encodedMessage = Buffer.from(emailMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      this.logger.log(
        `Email sent successfully to ${options.to}: ${result.data.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Envía múltiples emails (útil para notificaciones masivas)
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<{
    successful: number;
    failed: number;
    results: boolean[];
  }> {
    const results = await Promise.all(
      emails.map((email) => this.sendEmail(email)),
    );

    const successful = results.filter((result) => result === true).length;
    const failed = results.filter((result) => result === false).length;

    this.logger.log(
      `Bulk email send completed: ${successful} successful, ${failed} failed`,
    );

    return {
      successful,
      failed,
      results,
    };
  }

  /**
   * Envía email usando una plantilla con variables
   */
  async sendTemplatedEmail(
    template: string,
    variables: Record<string, any>,
    to: string,
    subject: string,
  ): Promise<boolean> {
    try {
      // Replace variables in template
      let html = template;
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, variables[key] || '');
      });

      return await this.sendEmail({
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send templated email to ${to}:`, error);
      return false;
    }
  }

  async sendTemplate(
    templateKey: string,
    to: string,
    variables: Record<string, any>,
  ): Promise<boolean> {
    // Esta función se implementará cuando tengamos el sistema de plantillas
    // Por ahora solo enviamos un email básico
    return await this.sendEmail({
      to,
      subject: `Notificación del Sistema de Asesorías - ${templateKey}`,
      html: `<p>Esta es una notificación del sistema. Tipo: ${templateKey}</p><pre>${JSON.stringify(variables, null, 2)}</pre>`,
    });
  }

  /**
   * Verifica la conectividad con la API de Gmail
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me',
      });

      this.logger.log(
        `Gmail API connection verified for: ${response.data.emailAddress}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Failed to verify Gmail API connection:', error);
      return false;
    }
  }
}
