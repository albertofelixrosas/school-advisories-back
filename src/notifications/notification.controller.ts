import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { NotificationService } from './notification.service';
import { EmailTemplateService } from './email-template.service';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { NotificationLogs } from './entities/notification-logs.entity';
import { EmailTemplates } from './entities/email-templates.entity';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
} from './dto/email-template.dto';
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

  @Post('templates')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new email template (Admin only)' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  async createEmailTemplate(
    @Body() dto: CreateEmailTemplateDto,
  ): Promise<EmailTemplates> {
    return this.emailTemplateService.createTemplate(dto);
  }

  @Patch('templates/:key')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update email template (Admin only)' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateEmailTemplate(
    @Param('key') key: string,
    @Body() dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplates> {
    return this.emailTemplateService.updateTemplate(key, dto);
  }

  @Delete('templates/:key')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete email template (Admin only)' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteEmailTemplate(@Param('key') key: string): Promise<void> {
    return this.emailTemplateService.deleteTemplate(key);
  }

  @Patch('templates/:key/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle template active status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Template status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async toggleTemplateStatus(
    @Param('key') key: string,
  ): Promise<EmailTemplates> {
    const template = await this.emailTemplateService.getTemplate(key);
    return this.emailTemplateService.updateTemplate(key, {
      is_active: !template.is_active,
    });
  }
}
