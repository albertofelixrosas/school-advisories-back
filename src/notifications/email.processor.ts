import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLogs } from './entities/notification-logs.entity';
import { EmailService, EmailOptions } from '../email/email.service';
import { EmailTemplateService } from './email-template.service';

interface EmailJobData {
  type: 'simple' | 'template';
  emailOptions?: EmailOptions;
  templateData?: {
    templateKey: string;
    to: string;
    variables: Record<string, any>;
  };
  notificationId?: number;
}

@Processor('notification-email')
@Injectable()
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @InjectRepository(NotificationLogs)
    private notificationLogsRepo: Repository<NotificationLogs>,
    private readonly emailService: EmailService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  @Process('send-simple-email')
  async handleSimpleEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing simple email job ${job.id}`);

    try {
      if (!job.data.emailOptions) {
        throw new Error('Email options are required for simple email');
      }

      const success = await this.emailService.sendEmail(job.data.emailOptions);

      if (job.data.notificationId) {
        await this.notificationLogsRepo.update(job.data.notificationId, {
          sent_successfully: success,
          sent_at: success ? new Date() : undefined,
          error_message: success ? undefined : 'Failed to send email',
        });
      }

      if (!success) {
        throw new Error('Failed to send simple email');
      }

      return { success, jobId: job.id };
    } catch (error) {
      this.logger.error(`Failed to process simple email job ${job.id}:`, error);

      if (job.data.notificationId) {
        await this.notificationLogsRepo.update(job.data.notificationId, {
          sent_successfully: false,
          error_message: error.message,
        });
      }

      throw error;
    }
  }

  @Process('send-template-email')
  async handleTemplateEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing template email job ${job.id}`);

    try {
      if (!job.data.templateData) {
        throw new Error('Template data is required for template email');
      }

      const { templateKey, to, variables } = job.data.templateData;

      const success = await this.emailTemplateService.sendTemplatedEmail(
        templateKey,
        to,
        variables,
      );

      if (job.data.notificationId) {
        await this.notificationLogsRepo.update(job.data.notificationId, {
          sent_successfully: success,
          sent_at: success ? new Date() : undefined,
          error_message: success ? undefined : 'Failed to send template email',
        });
      }

      if (!success) {
        throw new Error('Failed to send template email');
      }

      return { success, jobId: job.id, templateKey };
    } catch (error) {
      this.logger.error(
        `Failed to process template email job ${job.id}:`,
        error,
      );

      if (job.data.notificationId) {
        await this.notificationLogsRepo.update(job.data.notificationId, {
          sent_successfully: false,
          error_message: error.message,
        });
      }

      throw error;
    }
  }
}
