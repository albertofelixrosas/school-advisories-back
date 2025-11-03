import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLogs } from './entities/notification-logs.entity';
import * as nodemailer from 'nodemailer';

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  notificationId: number;
}

@Processor('notification-email')
@Injectable()
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(NotificationLogs)
    private notificationLogsRepo: Repository<NotificationLogs>,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Configuración SMTP (usar variables de entorno en producción)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  @Process('send-notification-email')
  async handleSendEmail(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, html, text, notificationId } = job.data;

    try {
      this.logger.log(
        `Processing email job ${job.id} for notification ${notificationId}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@advisories-itson.com',
        to,
        subject,
        html,
        text,
      });

      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Email sent successfully: ${result.messageId} to ${to}`,
      );

      // Actualizar el log de notificación
      await this.notificationLogsRepo.update(notificationId, {
        sent_successfully: true,
        sent_at: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Actualizar el log con el error
      await this.notificationLogsRepo.update(notificationId, {
        sent_successfully: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      // Re-lanzar el error para que Bull pueda manejarlo
      throw error;
    }
  }
}
