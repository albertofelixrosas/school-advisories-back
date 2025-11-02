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

@Injectable()
export class AdvisoryRequestService {
  constructor(
    @InjectRepository(AdvisoryRequest)
    private requestsRepo: Repository<AdvisoryRequest>,
    @InjectRepository(SubjectDetails)
    private subjectDetailsRepo: Repository<SubjectDetails>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
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

    // TODO: Enviar notificación por email al profesor
    // await this.notificationService.notifyNewRequest(savedRequest);

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

    // TODO: Enviar notificación por email al estudiante
    // await this.notificationService.notifyRequestApproved(updatedRequest);

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

    // TODO: Enviar notificación por email al estudiante
    // await this.notificationService.notifyRequestRejected(updatedRequest);

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

    // TODO: Enviar notificaciones
    // await this.notificationService.notifyRequestCancelled(updatedRequest);

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
}
