import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService, EmailOptions } from '../email/email.service';

export interface EmailJob {
  type: 'send-email' | 'send-template';
  data:
    | EmailOptions
    | {
        templateKey: string;
        to: string;
        variables: Record<string, any>;
      };
}

@Processor('email')
@Injectable()
export class EmailProcessor {
  constructor(private emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailOptions>) {
    await this.emailService.sendEmail(job.data);
  }

  @Process('send-template')
  async handleSendTemplate(
    job: Job<{
      templateKey: string;
      to: string;
      variables: Record<string, any>;
    }>,
  ) {
    await this.emailService.sendTemplate(
      job.data.templateKey,
      job.data.to,
      job.data.variables,
    );
  }
}
