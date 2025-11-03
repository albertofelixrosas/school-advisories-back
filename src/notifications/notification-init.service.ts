import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class NotificationInitService implements OnModuleInit {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.emailTemplateService.initializeDefaultTemplates();
      console.log('✅ Email templates initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email templates:', error);
    }
  }
}
