import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { EmailTemplateService } from './email-template.service';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { NotificationLogs } from './entities/notification-logs.entity';
import { EmailTemplates } from './entities/email-templates.entity';
import { RequestWithUser } from '../auth/types/request-with-user';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  @Get('preferences')
  @ApiOperation({
    summary: 'Obtener preferencias de notificaciones del usuario',
  })
  async getUserPreferences(
    @Request() req: RequestWithUser,
  ): Promise<NotificationPreferences> {
    return this.notificationService.getUserPreferences(req.user.user_id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Actualizar preferencias de notificaciones' })
  async updateUserPreferences(
    @Request() req: RequestWithUser,
    @Body() preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    return this.notificationService.updateUserPreferences(
      req.user.user_id,
      preferences,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtener historial de notificaciones' })
  async getNotificationHistory(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: number,
  ): Promise<NotificationLogs[]> {
    return this.notificationService.getNotificationHistory(
      req.user.user_id,
      limit || 50,
    );
  }

  @Get('templates')
  @ApiOperation({ summary: 'Obtener todas las plantillas de email' })
  async getEmailTemplates(): Promise<EmailTemplates[]> {
    return this.emailTemplateService.getAllTemplates();
  }

  @Get('templates/:key')
  @ApiOperation({ summary: 'Obtener plantilla específica por clave' })
  async getEmailTemplate(@Param('key') key: string): Promise<EmailTemplates> {
    return this.emailTemplateService.getTemplate(key);
  }
}
