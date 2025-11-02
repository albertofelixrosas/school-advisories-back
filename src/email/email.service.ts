import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get<string>('FROM_NAME')}" <${this.configService.get<string>('FROM_EMAIL')}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTemplate(
    templateKey: string,
    to: string,
    variables: Record<string, any>,
  ): Promise<void> {
    // Esta función se implementará cuando tengamos el sistema de plantillas
    // Por ahora solo enviamos un email básico
    await this.sendEmail({
      to,
      subject: `Notificación del Sistema de Asesorías - ${templateKey}`,
      html: `<p>Esta es una notificación del sistema. Tipo: ${templateKey}</p><pre>${JSON.stringify(variables, null, 2)}</pre>`,
    });
  }
}
