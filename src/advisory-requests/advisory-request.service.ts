import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvisoryRequest } from './entities/advisory-request.entity';
import { CreateAdvisoryRequestDto } from './dto/create-advisory-request.dto';
import { ApproveRequestDto, RejectRequestDto } from './dto/process-request.dto';
import { RequestStatus } from './request-status.enum';
import { UserRole } from '../users/user-role.enum';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../notifications/notification.service';
import { ProfessorAvailabilityService } from '../professor-availability/professor-availability.service';

@Injectable()
export class AdvisoryRequestService {
  constructor(
    @InjectRepository(AdvisoryRequest)
    private requestsRepo: Repository<AdvisoryRequest>,
    @InjectRepository(SubjectDetails)
    private subjectDetailsRepo: Repository<SubjectDetails>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private notificationService: NotificationService,
    private availabilityService: ProfessorAvailabilityService,
  ) {}

  async createRequest(
    studentId: number,
    createDto: CreateAdvisoryRequestDto,
  ): Promise<AdvisoryRequest> {
    // Verificar que el usuario sea estudiante
    const student = await this.usersRepo.findOne({
      where: { user_id: studentId, role: UserRole.STUDENT },
    });
    if (!student) {
      throw new ForbiddenException(
        'Solo los estudiantes pueden crear solicitudes de asesoría',
      );
    }

    // Verificar que la materia existe y obtener el profesor
    const subjectDetail = await this.subjectDetailsRepo.findOne({
      where: { subject_detail_id: createDto.subject_detail_id },
      relations: ['professor', 'subject'],
    });
    if (!subjectDetail) {
      throw new NotFoundException('La materia especificada no existe');
    }

    // Verificar que no existe una solicitud PENDING para la misma materia
    const existingRequest = await this.requestsRepo.findOne({
      where: {
        student_id: studentId,
        subject_detail_id: createDto.subject_detail_id,
        status: RequestStatus.PENDING,
      },
    });
    if (existingRequest) {
      throw new BadRequestException(
        'Ya tienes una solicitud pendiente para esta materia',
      );
    }

    // Crear la nueva solicitud
    const newRequest = this.requestsRepo.create({
      student_id: studentId,
      professor_id: subjectDetail.professor_id,
      subject_detail_id: createDto.subject_detail_id,
      student_message: createDto.student_message,
      status: RequestStatus.PENDING,
    });

    const savedRequest = await this.requestsRepo.save(newRequest);

    // Enviar notificación por email al profesor
    try {
      await this.notificationService.notifyAdvisoryRequestCreated(
        savedRequest,
        subjectDetail.professor,
        student,
      );
    } catch (error) {
      // Log error but don't fail the request creation
      console.error('Failed to send notification:', error);
    }

    return this.findOneWithRelations(savedRequest.request_id);
  }

  async findPendingByProfessor(
    professorId: number,
  ): Promise<AdvisoryRequest[]> {
    // Verificar que el usuario sea profesor
    const professor = await this.usersRepo.findOne({
      where: { user_id: professorId, role: UserRole.PROFESSOR },
    });
    if (!professor) {
      throw new ForbiddenException(
        'Solo los profesores pueden ver solicitudes pendientes',
      );
    }

    return this.requestsRepo.find({
      where: {
        professor_id: professorId,
        status: RequestStatus.PENDING,
      },
      relations: [
        'student',
        'professor',
        'subject_detail',
        'subject_detail.subject',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findMyRequests(studentId: number): Promise<AdvisoryRequest[]> {
    // Verificar que el usuario sea estudiante
    const student = await this.usersRepo.findOne({
      where: { user_id: studentId, role: UserRole.STUDENT },
    });
    if (!student) {
      throw new ForbiddenException(
        'Solo los estudiantes pueden ver sus solicitudes',
      );
    }

    return this.requestsRepo.find({
      where: { student_id: studentId },
      relations: [
        'student',
        'professor',
        'subject_detail',
        'subject_detail.subject',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async approveRequest(
    requestId: number,
    professorId: number,
    approvalDto: ApproveRequestDto,
  ): Promise<AdvisoryRequest> {
    const request = await this.findOneWithValidation(requestId, professorId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Solo se pueden aprobar solicitudes pendientes',
      );
    }

    // Actualizar la solicitud
    request.status = RequestStatus.APPROVED;
    request.professor_response = approvalDto.professor_response;
    request.processed_at = new Date();
    request.processed_by_id = professorId;

    const updatedRequest = await this.requestsRepo.save(request);

    // TODO: Crear automáticamente una sesión de asesoría si se proporcionó fecha
    // if (approvalDto.proposed_date) {
    //   await this.advisoryService.createSessionFromRequest(updatedRequest, approvalDto.proposed_date);
    // }

    // Enviar notificación por email al estudiante
    try {
      await this.notificationService.notifyAdvisoryRequestApproved(
        updatedRequest,
        request.professor,
        request.student,
      );
    } catch (error) {
      // Log error but don't fail the approval
      console.error('Failed to send approval notification:', error);
    }

    return this.findOneWithRelations(updatedRequest.request_id);
  }

  async rejectRequest(
    requestId: number,
    professorId: number,
    rejectionDto: RejectRequestDto,
  ): Promise<AdvisoryRequest> {
    const request = await this.findOneWithValidation(requestId, professorId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Solo se pueden rechazar solicitudes pendientes',
      );
    }

    // Actualizar la solicitud
    request.status = RequestStatus.REJECTED;
    request.professor_response = rejectionDto.professor_response;
    request.processed_at = new Date();
    request.processed_by_id = professorId;

    const updatedRequest = await this.requestsRepo.save(request);

    // Enviar notificación por email al estudiante
    try {
      await this.notificationService.notifyAdvisoryRequestRejected(
        updatedRequest,
        request.professor,
        request.student,
      );
    } catch (error) {
      // Log error but don't fail the rejection
      console.error('Failed to send rejection notification:', error);
    }

    return this.findOneWithRelations(updatedRequest.request_id);
  }

  async cancelRequest(
    requestId: number,
    userId: number,
  ): Promise<AdvisoryRequest> {
    const request = await this.requestsRepo.findOne({
      where: { request_id: requestId },
      relations: ['student', 'professor'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Verificar permisos: solo el estudiante o el profesor pueden cancelar
    if (request.student_id !== userId && request.professor_id !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para cancelar esta solicitud',
      );
    }

    // Solo se pueden cancelar solicitudes PENDING o APPROVED
    if (
      ![RequestStatus.PENDING, RequestStatus.APPROVED].includes(request.status)
    ) {
      throw new BadRequestException(
        'No se puede cancelar una solicitud en este estado',
      );
    }

    request.status = RequestStatus.CANCELLED;
    request.processed_at = new Date();
    request.processed_by_id = userId;

    const updatedRequest = await this.requestsRepo.save(request);

    // Enviar notificaciones a la parte contraria (si canceló el estudiante, notificar al profesor y viceversa)
    try {
      const cancelledBy = await this.usersRepo.findOne({
        where: { user_id: userId },
      });

      if (!cancelledBy) {
        throw new Error('User not found');
      }

      // Determinar quién debe recibir la notificación
      const recipient =
        userId === request.student_id ? request.professor : request.student;

      await this.notificationService.notifyAdvisoryCancelled(
        updatedRequest,
        cancelledBy,
        recipient,
      );
    } catch (error) {
      // Log error but don't fail the cancellation
      console.error('Failed to send cancellation notification:', error);
    }

    return this.findOneWithRelations(updatedRequest.request_id);
  }

  private async findOneWithValidation(
    requestId: number,
    professorId: number,
  ): Promise<AdvisoryRequest> {
    const request = await this.requestsRepo.findOne({
      where: { request_id: requestId },
      relations: ['student', 'professor', 'subject_detail'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.professor_id !== professorId) {
      throw new ForbiddenException(
        'No tienes permisos para procesar esta solicitud',
      );
    }

    return request;
  }

  private async findOneWithRelations(
    requestId: number,
  ): Promise<AdvisoryRequest> {
    const request = await this.requestsRepo.findOne({
      where: { request_id: requestId },
      relations: [
        'student',
        'professor',
        'subject_detail',
        'subject_detail.subject',
        'processed_by',
      ],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return request;
  }

  /**
   * Obtiene horarios disponibles para una materia específica
   */
  async getAvailableSchedulesForSubject(
    subjectDetailId: number,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<{
    subject_detail: {
      subject_detail_id: number;
      subject_name: string;
      professor: {
        user_id: number;
        name: string;
        last_name: string;
      };
    };
    available_dates: Array<{
      date: string;
      slots: Array<{
        availability_id: number;
        start_time: string;
        end_time: string;
        available_spots: number;
        max_students: number;
      }>;
    }>;
  }> {
    // Obtener información de la materia y profesor
    const subjectDetail = await this.subjectDetailsRepo.findOne({
      where: { subject_detail_id: subjectDetailId },
      relations: ['subject', 'professor'],
    });

    if (!subjectDetail) {
      throw new NotFoundException(
        `Subject detail with ID ${subjectDetailId} not found`,
      );
    }

    // Obtener disponibilidad del profesor para esta materia
    const availability = await this.availabilityService.getAvailability({
      professor_id: subjectDetail.professor_id,
      subject_detail_id: subjectDetailId,
    });

    // Generar fechas disponibles en el rango especificado
    const startDate = dateFrom || new Date();
    const endDate = dateTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días por defecto

    const availableDates: Array<{
      date: string;
      slots: Array<{
        availability_id: number;
        start_time: string;
        end_time: string;
        available_spots: number;
        max_students: number;
      }>;
    }> = [];

    // Iterar por cada día en el rango
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const daySlots = await Promise.all(
        availability
          .filter((slot) =>
            this.matchesDayOfWeek(currentDate, slot.day_of_week),
          )
          .map(async (slot) => {
            const availableSlots =
              await this.availabilityService.getAvailableSlots(
                subjectDetail.professor_id,
                subjectDetailId,
                currentDate,
              );

            return availableSlots.slots.find(
              (availableSlot) =>
                availableSlot.availability_id === slot.availability_id,
            );
          }),
      );

      const validSlots = daySlots.filter((slot) => slot !== undefined);

      if (validSlots.length > 0) {
        availableDates.push({
          date: currentDate.toISOString().split('T')[0],
          slots: validSlots,
        });
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      subject_detail: {
        subject_detail_id: subjectDetail.subject_detail_id,
        subject_name: subjectDetail.subject.subject,
        professor: {
          user_id: subjectDetail.professor.user_id,
          name: subjectDetail.professor.name,
          last_name: subjectDetail.professor.last_name,
        },
      },
      available_dates: availableDates,
    };
  }

  private matchesDayOfWeek(date: Date, dayOfWeek: string): boolean {
    const dayNames = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return dayNames[date.getDay()] === dayOfWeek;
  }
}
