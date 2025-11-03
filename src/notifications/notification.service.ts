import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  EmailTemplateService,
  TemplateVariables,
} from './email-template.service';
import { NotificationLogs } from './entities/notification-logs.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { AdvisoryRequest } from '../advisory-requests/entities/advisory-request.entity';
import { User } from '../users/entities/user.entity';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationEvent {
  ADVISORY_REQUEST_CREATED = 'advisory_request_created',
  ADVISORY_REQUEST_APPROVED = 'advisory_request_approved',
  ADVISORY_REQUEST_REJECTED = 'advisory_request_rejected',
  ADVISORY_REQUEST_CANCELLED = 'advisory_request_cancelled',
  ADVISORY_SESSION_REMINDER = 'advisory_session_reminder',
}

interface NotificationPayload {
  recipient_id: number;
  type: NotificationType;
  event: NotificationEvent;
  template_key: string;
  variables: TemplateVariables;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationLogs)
    private notificationLogsRepo: Repository<NotificationLogs>,
    @InjectRepository(NotificationPreferences)
    private notificationPrefsRepo: Repository<NotificationPreferences>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectQueue('email') private emailQueue: Queue,
    private emailTemplateService: EmailTemplateService,
  ) {}

  async sendNotification(payload: NotificationPayload): Promise<void> {
    // Verificar preferencias del usuario
    const preferences = await this.getUserPreferences(payload.recipient_id);

    if (
      !this.shouldSendNotification(preferences, payload.event, payload.type)
    ) {
      console.log(
        `Notification skipped for user ${payload.recipient_id} - disabled in preferences`,
      );
      return;
    }

    // Obtener información del usuario
    const recipient = await this.userRepo.findOne({
      where: { user_id: payload.recipient_id },
    });

    if (!recipient) {
      throw new Error(`User with ID ${payload.recipient_id} not found`);
    }

    // Crear log de la notificación
    const notificationLog = await this.createNotificationLog({
      user_id: payload.recipient_id,
      notification_type: payload.type,
      subject: `Notificación: ${payload.template_key}`,
      content: JSON.stringify(payload.variables),
      sent_to: recipient.email,
    });

    try {
      // Enviar según el tipo
      if (payload.type === NotificationType.EMAIL) {
        await this.sendEmailNotification(
          recipient,
          payload.template_key,
          payload.variables,
          notificationLog.log_id,
        );
      }
      // Aquí se pueden agregar SMS y PUSH notifications en el futuro

      // Actualizar log como exitoso
      await this.updateNotificationLog(notificationLog.log_id, {
        sent_successfully: true,
        sent_at: new Date(),
      });
    } catch (error) {
      // Actualizar log como fallido
      await this.updateNotificationLog(notificationLog.log_id, {
        sent_successfully: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async sendEmailNotification(
    recipient: User,
    templateKey: string,
    variables: TemplateVariables,
    notificationId: number,
  ): Promise<void> {
    const template = await this.emailTemplateService.getTemplate(templateKey);
    const renderedTemplate = this.emailTemplateService.renderTemplate(
      template,
      variables,
    );

    // Agregar el email a la cola para procesamiento asíncrono
    await this.emailQueue.add('send-email', {
      to: recipient.email,
      subject: renderedTemplate.subject,
      html: renderedTemplate.html,
      text: renderedTemplate.text,
      notificationId,
    });
  }

  async getUserPreferences(userId: number): Promise<NotificationPreferences> {
    let preferences = await this.notificationPrefsRepo.findOne({
      where: { user_id: userId },
    });

    // Si no existen preferencias, crear las predeterminadas
    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  private async createDefaultPreferences(
    userId: number,
  ): Promise<NotificationPreferences> {
    const defaultPrefs = this.notificationPrefsRepo.create({
      user_id: userId,
      email_new_request: true,
      email_request_approved: true,
      email_request_rejected: true,
      email_advisory_cancelled: true,
      email_daily_reminders: true,
      email_session_reminders: true,
    });

    return this.notificationPrefsRepo.save(defaultPrefs);
  }

  private shouldSendNotification(
    preferences: NotificationPreferences,
    event: NotificationEvent,
    type: NotificationType,
  ): boolean {
    // Solo EMAIL está implementado actualmente
    if (type !== NotificationType.EMAIL) {
      return false;
    }

    // Verificar si el tipo de evento específico está habilitado
    switch (event) {
      case NotificationEvent.ADVISORY_REQUEST_CREATED:
        return preferences.email_new_request;

      case NotificationEvent.ADVISORY_REQUEST_APPROVED:
        return preferences.email_request_approved;

      case NotificationEvent.ADVISORY_REQUEST_REJECTED:
        return preferences.email_request_rejected;

      case NotificationEvent.ADVISORY_REQUEST_CANCELLED:
        return preferences.email_advisory_cancelled;

      case NotificationEvent.ADVISORY_SESSION_REMINDER:
        return preferences.email_session_reminders;

      default:
        return true;
    }
  }

  private async createNotificationLog(data: {
    user_id: number;
    notification_type: string;
    subject: string;
    content: string;
    sent_to: string;
  }): Promise<NotificationLogs> {
    const log = this.notificationLogsRepo.create(data);
    return this.notificationLogsRepo.save(log);
  }

  private async updateNotificationLog(
    logId: number,
    updateData: {
      sent_successfully?: boolean;
      sent_at?: Date;
      error_message?: string;
    },
  ): Promise<void> {
    await this.notificationLogsRepo.update(logId, updateData);
  }

  // Métodos específicos para eventos de asesorías
  async notifyAdvisoryRequestCreated(
    advisoryRequest: AdvisoryRequest,
    professor: User,
    student: User,
  ): Promise<void> {
    const variables: TemplateVariables = {
      professor_name: `${professor.name} ${professor.last_name}`,
      student_name: `${student.name} ${student.last_name}`,
      student_email: student.email,
      subject_name: 'Materia solicitada', // TODO: obtener de subject_detail
      student_message: advisoryRequest.student_message || 'Sin mensaje',
      created_at: advisoryRequest.created_at.toLocaleDateString(),
    };

    await this.sendNotification({
      recipient_id: professor.user_id,
      type: NotificationType.EMAIL,
      event: NotificationEvent.ADVISORY_REQUEST_CREATED,
      template_key: 'advisory_request_new',
      variables,
      metadata: {
        advisory_request_id: advisoryRequest.request_id,
        student_id: student.user_id,
      },
    });
  }

  async notifyAdvisoryRequestApproved(
    advisoryRequest: AdvisoryRequest,
    professor: User,
    student: User,
  ): Promise<void> {
    const variables: TemplateVariables = {
      student_name: `${student.name} ${student.last_name}`,
      professor_name: `${professor.name} ${professor.last_name}`,
      subject_name: 'Materia solicitada',
      professor_response: advisoryRequest.professor_response || 'Aprobada',
      processed_at: advisoryRequest.processed_at?.toLocaleDateString() || '',
    };

    await this.sendNotification({
      recipient_id: student.user_id,
      type: NotificationType.EMAIL,
      event: NotificationEvent.ADVISORY_REQUEST_APPROVED,
      template_key: 'advisory_request_approved',
      variables,
      metadata: {
        advisory_request_id: advisoryRequest.request_id,
        professor_id: professor.user_id,
      },
    });
  }

  async notifyAdvisoryRequestRejected(
    advisoryRequest: AdvisoryRequest,
    professor: User,
    student: User,
  ): Promise<void> {
    const variables: TemplateVariables = {
      student_name: `${student.name} ${student.last_name}`,
      professor_name: `${professor.name} ${professor.last_name}`,
      subject_name: 'Materia solicitada',
      professor_response:
        advisoryRequest.professor_response || 'No especificado',
      processed_at: advisoryRequest.processed_at?.toLocaleDateString() || '',
    };

    await this.sendNotification({
      recipient_id: student.user_id,
      type: NotificationType.EMAIL,
      event: NotificationEvent.ADVISORY_REQUEST_REJECTED,
      template_key: 'advisory_request_rejected',
      variables,
      metadata: {
        advisory_request_id: advisoryRequest.request_id,
        professor_id: professor.user_id,
      },
    });
  }

  async notifyAdvisoryCancelled(
    advisoryRequest: AdvisoryRequest,
    cancelledBy: User,
    recipient: User,
  ): Promise<void> {
    const variables: TemplateVariables = {
      recipient_name: `${recipient.name} ${recipient.last_name}`,
      subject_name: 'Materia cancelada',
      cancelled_by: `${cancelledBy.name} ${cancelledBy.last_name}`,
      cancelled_at: new Date().toLocaleDateString(),
    };

    await this.sendNotification({
      recipient_id: recipient.user_id,
      type: NotificationType.EMAIL,
      event: NotificationEvent.ADVISORY_REQUEST_CANCELLED,
      template_key: 'advisory_cancelled',
      variables,
      metadata: {
        advisory_request_id: advisoryRequest.request_id,
        cancelled_by_id: cancelledBy.user_id,
      },
    });
  }

  // Métodos para gestionar preferencias
  async updateUserPreferences(
    userId: number,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const existing = await this.getUserPreferences(userId);
    Object.assign(existing, preferences);
    return this.notificationPrefsRepo.save(existing);
  }

  async getNotificationHistory(
    userId: number,
    limit = 50,
  ): Promise<NotificationLogs[]> {
    return this.notificationLogsRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
