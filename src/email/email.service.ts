import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const config = {
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_PORT') === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(config);

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email service configuration error:', error);
      } else {
        this.logger.log('Email service is ready to send messages');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: this.configService.get('FROM_NAME') || 'Sistema de Asesorías',
          address: this.configService.get('FROM_EMAIL'),
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully to ${options.to}: ${result.messageId}`,
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
}
