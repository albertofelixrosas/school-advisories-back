import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  StudentInvitation,
  InvitationStatus,
} from '../entities/student-invitation.entity';
import { AdvisoryDate } from 'src/advisory-dates/entities/advisory-date.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/user-role.enum';
import {
  InviteStudentsDto,
  RespondInvitationDto,
  InvitationResponseDto,
} from '../dto/invitation.dto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(StudentInvitation)
    private invitationRepo: Repository<StudentInvitation>,
    @InjectRepository(AdvisoryDate)
    private advisoryDateRepo: Repository<AdvisoryDate>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Invita estudiantes a una sesión específica
   */
  async inviteStudentsToSession(
    advisoryDateId: number,
    dto: InviteStudentsDto,
    professorId: number,
  ): Promise<InvitationResponseDto[]> {
    // 1. Validar que la sesión existe y el profesor está autorizado
    const advisoryDate = await this.advisoryDateRepo.findOne({
      where: { advisory_date_id: advisoryDateId },
      relations: ['advisory', 'advisory.professor'],
    });

    if (!advisoryDate) {
      throw new NotFoundException('Advisory session not found');
    }

    if (advisoryDate.advisory.professor.user_id !== professorId) {
      throw new ForbiddenException(
        'You can only invite students to your own sessions',
      );
    }

    // 2. Validar que los estudiantes existen
    const students = await this.userRepo.find({
      where: dto.student_ids.map((id) => ({
        user_id: id,
        role: UserRole.STUDENT,
      })),
    });

    if (students.length !== dto.student_ids.length) {
      throw new BadRequestException(
        'One or more students not found or not valid students',
      );
    }

    // 3. Calcular fecha de expiración (24h por defecto)
    const expiresAt =
      dto.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 4. Crear invitaciones
    const invitations: StudentInvitation[] = [];

    for (const studentId of dto.student_ids) {
      // Verificar si ya existe invitación pendiente
      const existingInvitation = await this.invitationRepo.findOne({
        where: {
          advisory_date_id: advisoryDateId,
          student_id: studentId,
          status: InvitationStatus.PENDING,
        },
      });

      if (existingInvitation) {
        // Actualizar invitación existente
        existingInvitation.invitation_message = dto.invitation_message || '';
        existingInvitation.expires_at = expiresAt;
        existingInvitation.updated_at = new Date();
        invitations.push(await this.invitationRepo.save(existingInvitation));
      } else {
        // Crear nueva invitación
        const newInvitation = this.invitationRepo.create({
          advisory_date_id: advisoryDateId,
          student_id: studentId,
          invited_by_id: professorId,
          invitation_message: dto.invitation_message,
          expires_at: expiresAt,
        });
        invitations.push(await this.invitationRepo.save(newInvitation));
      }
    }

    // 5. TODO: Enviar notificaciones por email
    this.sendInvitationEmails(invitations);

    // 6. Retornar DTOs de respuesta
    return invitations.map((invitation) => this.mapToResponseDto(invitation));
  }

  /**
   * Estudiante responde a una invitación
   */
  async respondToInvitation(
    invitationId: number,
    dto: RespondInvitationDto,
    studentId: number,
  ): Promise<InvitationResponseDto> {
    // 1. Buscar invitación
    const invitation = await this.invitationRepo.findOne({
      where: {
        invitation_id: invitationId,
        student_id: studentId,
      },
      relations: ['advisory_date', 'student'],
    });

    if (!invitation) {
      throw new NotFoundException(
        'Invitation not found or you are not authorized to respond',
      );
    }

    // 2. Validar estado
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation has already been responded to');
    }

    // 3. Validar expiración
    if (invitation.expires_at && new Date() > invitation.expires_at) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepo.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    // 4. Actualizar invitación
    invitation.status = dto.status;
    invitation.response_message = dto.response_message || null;
    invitation.responded_at = new Date();

    const updatedInvitation = await this.invitationRepo.save(invitation);

    // 5. TODO: Si acepta, registrar asistencia automáticamente
    if (dto.status === InvitationStatus.ACCEPTED) {
      this.registerStudentAttendance(invitation.advisory_date_id, studentId);
    }

    // 6. TODO: Notificar al profesor de la respuesta
    this.notifyProfessorOfResponse(updatedInvitation);

    return this.mapToResponseDto(updatedInvitation);
  }

  /**
   * Obtener invitaciones de un estudiante
   */
  async getStudentInvitations(
    studentId: number,
    status?: InvitationStatus,
  ): Promise<InvitationResponseDto[]> {
    const whereCondition: FindOptionsWhere<StudentInvitation> = {
      student_id: studentId,
    };

    if (status) {
      whereCondition.status = status;
    }

    const invitations = await this.invitationRepo.find({
      where: whereCondition,
      relations: [
        'advisory_date',
        'advisory_date.advisory',
        'advisory_date.advisory.subject_detail',
      ],
      order: { created_at: 'DESC' },
    });

    return invitations.map((invitation) => this.mapToResponseDto(invitation));
  }

  /**
   * Obtener invitaciones de una sesión específica
   */
  async getSessionInvitations(
    advisoryDateId: number,
    professorId?: number,
  ): Promise<InvitationResponseDto[]> {
    const invitations = await this.invitationRepo.find({
      where: { advisory_date_id: advisoryDateId },
      relations: ['student', 'advisory_date'],
    });

    // Si se proporciona professorId, verificar autorización
    if (professorId && invitations.length > 0) {
      const advisoryDate = await this.advisoryDateRepo.findOne({
        where: { advisory_date_id: advisoryDateId },
        relations: ['advisory', 'advisory.professor'],
      });

      if (advisoryDate?.advisory.professor.user_id !== professorId) {
        throw new ForbiddenException(
          'You can only view invitations for your own sessions',
        );
      }
    }

    return invitations.map((invitation) => this.mapToResponseDto(invitation));
  }

  /**
   * Mapea entidad a DTO de respuesta
   */
  private mapToResponseDto(
    invitation: StudentInvitation,
  ): InvitationResponseDto {
    return {
      invitation_id: invitation.invitation_id,
      advisory_date_id: invitation.advisory_date_id,
      student_id: invitation.student_id,
      status: invitation.status,
      invitation_message: invitation.invitation_message || '',
      created_at: invitation.created_at,
      expires_at: invitation.expires_at || new Date(),
      student: invitation.student
        ? {
            user_id: invitation.student.user_id,
            name: invitation.student.name,
            last_name: invitation.student.last_name,
            email: invitation.student.email,
          }
        : undefined,
      advisory_date: invitation.advisory_date
        ? {
            advisory_date_id: invitation.advisory_date.advisory_date_id,
            topic: invitation.advisory_date.topic,
            date: invitation.advisory_date.date,
            venue_id: invitation.advisory_date.venue_id,
          }
        : undefined,
    };
  }

  /**
   * Envía emails de invitación (placeholder)
   */
  private sendInvitationEmails(invitations: StudentInvitation[]): void {
    // TODO: Implementar con el sistema de notificaciones
    console.log(`Sending invitation emails to ${invitations.length} students`);
  }

  /**
   * Registra asistencia automática cuando acepta invitación (placeholder)
   */
  private registerStudentAttendance(
    advisoryDateId: number,
    studentId: number,
  ): void {
    // TODO: Integrar con AdvisoryAttendanceService
    console.log(
      `Auto-registering attendance for student ${studentId} in session ${advisoryDateId}`,
    );
  }

  /**
   * Notifica al profesor de la respuesta (placeholder)
   */
  private notifyProfessorOfResponse(invitation: StudentInvitation): void {
    // TODO: Implementar notificación por email al profesor
    console.log(
      `Notifying professor of response to invitation ${invitation.invitation_id}`,
    );
  }
}
