import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplates } from './entities/email-templates.entity';

export interface TemplateVariables {
  [key: string]: string | number | boolean | Date;
}

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplates)
    private templatesRepo: Repository<EmailTemplates>,
  ) {}

  async getTemplate(key: string): Promise<EmailTemplates> {
    const template = await this.templatesRepo.findOne({
      where: { template_key: key, is_active: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with key '${key}' not found`);
    }

    return template;
  }

  renderTemplate(
    template: EmailTemplates,
    variables: TemplateVariables,
  ): { subject: string; html: string; text?: string } {
    // Función simple para reemplazar variables en formato {{variable}}
    const replaceVariables = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = variables[key];
        return value !== undefined ? String(value) : match;
      });
    };

    return {
      subject: replaceVariables(template.subject),
      html: replaceVariables(template.html_content),
      text: template.text_content
        ? replaceVariables(template.text_content)
        : undefined,
    };
  }

  getAllTemplates(): Promise<EmailTemplates[]> {
    return this.templatesRepo.find({
      order: { template_key: 'ASC' },
    });
  }

  createTemplate(templateData: {
    template_key: string;
    template_name: string;
    subject: string;
    html_content: string;
    text_content?: string;
    variables?: TemplateVariables;
  }): Promise<EmailTemplates> {
    const template = this.templatesRepo.create(templateData);
    return this.templatesRepo.save(template);
  }

  async updateTemplate(
    key: string,
    updateData: {
      template_name?: string;
      subject?: string;
      html_content?: string;
      text_content?: string;
      variables?: TemplateVariables;
      is_active?: boolean;
    },
  ): Promise<EmailTemplates> {
    const template = await this.getTemplate(key);

    Object.assign(template, updateData);

    return this.templatesRepo.save(template);
  }

  async deleteTemplate(key: string): Promise<void> {
    const template = await this.getTemplate(key);
    await this.templatesRepo.remove(template);
  }

  /**
   * Envía email usando una plantilla con variables
   */
  async sendTemplatedEmail(
    templateKey: string,
    to: string,
    variables: Record<string, any>,
  ): Promise<boolean> {
    try {
      const template = await this.getTemplate(templateKey);
      this.renderTemplate(template, variables);

      // Aquí necesitaríamos inyectar EmailService, pero para evitar dependencia circular
      // vamos a devolver falso por ahora y usar este método desde el EmailService
      return false; // Placeholder - implementar integración correcta
    } catch {
      return false;
    }
  }

  async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        template_key: 'advisory_request_new',
        template_name: 'Nueva Solicitud de Asesoría',
        subject: 'Nueva solicitud de asesoría - {{student_name}}',
        html_content: `
          <h2>Nueva Solicitud de Asesoría</h2>
          <p>Hola <strong>{{professor_name}}</strong>,</p>
          <p>El estudiante <strong>{{student_name}}</strong> ha solicitado una asesoría para la materia <strong>{{subject_name}}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la solicitud:</h3>
            <ul>
              <li><strong>Estudiante:</strong> {{student_name}} ({{student_email}})</li>
              <li><strong>Materia:</strong> {{subject_name}}</li>
              <li><strong>Mensaje del estudiante:</strong> {{student_message}}</li>
              <li><strong>Fecha de solicitud:</strong> {{created_at}}</li>
            </ul>
          </div>
          
          <p>Puedes revisar y procesar esta solicitud ingresando al sistema de asesorías.</p>
          <p>Saludos,<br>Sistema de Asesorías ITSON</p>
        `,
        text_content:
          'Nueva solicitud de asesoría de {{student_name}} para {{subject_name}}. Mensaje: {{student_message}}',
      },
      {
        template_key: 'advisory_request_approved',
        template_name: 'Solicitud de Asesoría Aprobada',
        subject: 'Tu solicitud de asesoría ha sido aprobada - {{subject_name}}',
        html_content: `
          <h2>¡Tu Solicitud ha sido Aprobada!</h2>
          <p>Hola <strong>{{student_name}}</strong>,</p>
          <p>Nos complace informarte que tu solicitud de asesoría para <strong>{{subject_name}}</strong> ha sido aprobada.</p>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la asesoría:</h3>
            <ul>
              <li><strong>Materia:</strong> {{subject_name}}</li>
              <li><strong>Profesor:</strong> {{professor_name}}</li>
              <li><strong>Respuesta del profesor:</strong> {{professor_response}}</li>
              <li><strong>Fecha de aprobación:</strong> {{processed_at}}</li>
            </ul>
          </div>
          
          <p>El profesor se pondrá en contacto contigo para coordinar los detalles de la asesoría.</p>
          <p>Saludos,<br>Sistema de Asesorías ITSON</p>
        `,
        text_content:
          'Tu solicitud para {{subject_name}} ha sido aprobada. Respuesta: {{professor_response}}',
      },
      {
        template_key: 'advisory_request_rejected',
        template_name: 'Solicitud de Asesoría Rechazada',
        subject:
          'Actualización sobre tu solicitud de asesoría - {{subject_name}}',
        html_content: `
          <h2>Actualización de tu Solicitud</h2>
          <p>Hola <strong>{{student_name}}</strong>,</p>
          <p>Lamentamos informarte que tu solicitud de asesoría para <strong>{{subject_name}}</strong> no pudo ser procesada en este momento.</p>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles:</h3>
            <ul>
              <li><strong>Materia:</strong> {{subject_name}}</li>
              <li><strong>Profesor:</strong> {{professor_name}}</li>
              <li><strong>Razón:</strong> {{professor_response}}</li>
              <li><strong>Fecha:</strong> {{processed_at}}</li>
            </ul>
          </div>
          
          <p>Te sugerimos que intentes crear una nueva solicitud en otro momento o contactes directamente con el profesor.</p>
          <p>Saludos,<br>Sistema de Asesorías ITSON</p>
        `,
        text_content:
          'Tu solicitud para {{subject_name}} no pudo ser procesada. Razón: {{professor_response}}',
      },
      {
        template_key: 'advisory_cancelled',
        template_name: 'Asesoría Cancelada',
        subject: 'Cancelación de asesoría - {{subject_name}}',
        html_content: `
          <h2>Asesoría Cancelada</h2>
          <p>Hola <strong>{{recipient_name}}</strong>,</p>
          <p>Te informamos que la asesoría para <strong>{{subject_name}}</strong> ha sido cancelada.</p>
          
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la cancelación:</h3>
            <ul>
              <li><strong>Materia:</strong> {{subject_name}}</li>
              <li><strong>Cancelado por:</strong> {{cancelled_by}}</li>
              <li><strong>Fecha de cancelación:</strong> {{cancelled_at}}</li>
            </ul>
          </div>
          
          <p>Si tienes alguna pregunta, no dudes en contactar al profesor o crear una nueva solicitud.</p>
          <p>Saludos,<br>Sistema de Asesorías ITSON</p>
        `,
        text_content:
          'La asesoría para {{subject_name}} ha sido cancelada por {{cancelled_by}}.',
      },
    ];

    for (const template of defaultTemplates) {
      const exists = await this.templatesRepo.findOne({
        where: { template_key: template.template_key },
      });

      if (!exists) {
        await this.createTemplate(template);
      }
    }
  }
}
