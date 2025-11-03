import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { EmailTemplateService } from './email-template.service';
import { NotificationController } from './notification.controller';
import { EmailProcessor } from './email.processor';
import { NotificationInitService } from './notification-init.service';
import { EmailTemplates } from './entities/email-templates.entity';
import { NotificationLogs } from './entities/notification-logs.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailTemplates,
      NotificationLogs,
      NotificationPreferences,
      User,
    ]),
    BullModule.registerQueue({
      name: 'notification-email',
    }),
    EmailModule,
  ],
  providers: [
    NotificationService,
    EmailTemplateService,
    EmailProcessor,
    NotificationInitService,
  ],
  controllers: [NotificationController],
  exports: [NotificationService, EmailTemplateService],
})
export class NotificationModule {}
