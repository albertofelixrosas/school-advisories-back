import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advisory } from './entities/advisory.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { CreateDirectSessionDto } from './dto/create-direct-session.dto';
import { SubjectDetails } from 'src/subject-details/entities/subject-detail.entity';
import { AdvisorySchedule } from 'src/advisory-schedules/entities/advisory-schedule.entity';
import { AdvisoryDate } from 'src/advisory-dates/entities/advisory-date.entity';
import { Venue } from 'src/venues/entities/venue.entity';
import { UserRole } from 'src/users/user-role.enum';
import { AdvisoryStatus } from './advisory-status.enum';
import { AdvisoryResponseDto } from './dto/advisory-response.dto';
import { WeekDay } from 'src/common/week-day.enum';

@Injectable()
export class AdvisoriesService {
  constructor(
    @InjectRepository(Advisory)
    private readonly advisoryRepo: Repository<Advisory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SubjectDetails)
    private readonly subjectDetailRepo: Repository<SubjectDetails>,
    @InjectRepository(AdvisorySchedule)
    private readonly advisoryScheduleRepo: Repository<AdvisorySchedule>,
    @InjectRepository(AdvisoryDate)
    private readonly advisoryDateRepo: Repository<AdvisoryDate>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
  ) {}

  private generateAdvisoryResponse(advisory: Advisory): AdvisoryResponseDto {
    const result: AdvisoryResponseDto = {
      advisory_id: advisory.advisory_id,
      max_students: advisory.max_students,
      professor: {
        user_id: advisory.professor.user_id,
        school_id: advisory.professor.school_id,
        name: advisory.professor.name,
        last_name: advisory.professor.last_name,
        email: advisory.professor.email,
        photo_url: advisory.professor.photo_url,
      },
      subject_detail: {
        subject_detail_id: advisory.subject_detail.subject_detail_id,
        subject_name: advisory.subject_detail.subject.subject,
        schedules: advisory.subject_detail.schedules.map((s) => ({
          day: s.day,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      },
      schedules: advisory.schedules.map((schedule) => ({
        advisory_schedule_id: schedule.advisory_schedule_id,
        day: schedule.day,
        begin_time: schedule.begin_time,
        end_time: schedule.end_time,
      })),
    };
    return result;
  }

  async create(dto: CreateAdvisoryDto): Promise<AdvisoryResponseDto> {
    const professor = await this.userRepo.findOne({
      where: { user_id: dto.professor_id, role: UserRole.PROFESSOR },
    });
    if (!professor) {
      throw new NotFoundException(`Professor ID ${dto.professor_id} not found`);
    }
    const subjectDetail = await this.subjectDetailRepo.findOne({
      where: { subject_detail_id: dto.subject_detail_id },
    });
    if (!subjectDetail) {
      throw new NotFoundException(
        `Subject Detail ID ${dto.subject_detail_id} not found`,
      );
    }

    const advisory = this.advisoryRepo.create({
      ...dto,
      professor,
      subject_detail: subjectDetail,
    });

    // Validate schedules if provided
    if (!dto.schedules || !Array.isArray(dto.schedules)) {
      throw new NotFoundException(
        `Schedules must be provided as an array in the advisory creation request`,
      );
    }

    const savedAvisory = await this.advisoryRepo.save(advisory);

    const schedules = dto.schedules.map((schedule) => {
      return this.advisoryScheduleRepo.create({
        ...schedule,
        advisory: savedAvisory,
      });
    });

    await this.advisoryScheduleRepo.save(schedules);

    const advisoryWithSchedules = await this.advisoryRepo.save({
      ...savedAvisory,
      schedules,
    });

    return this.generateAdvisoryResponse(advisoryWithSchedules);
  }

  async findOne(id: number): Promise<AdvisoryResponseDto> {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
      relations: [
        'professor',
        'subject_detail',
        'schedules',
        'subject_detail.subject',
      ],
    });
    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }

    const result = this.generateAdvisoryResponse(advisory);
    return result;
  }

  async findAll(): Promise<AdvisoryResponseDto[]> {
    const advisories = await this.advisoryRepo.find({
      relations: [
        'professor',
        'subject_detail',
        'schedules',
        'subject_detail.subject',
      ],
    });
    const results: AdvisoryResponseDto[] = advisories.map((advisory) =>
      this.generateAdvisoryResponse(advisory),
    );

    return results;
  }

  async update(
    id: number,
    dto: UpdateAdvisoryDto,
  ): Promise<AdvisoryResponseDto> {
    const advisory = await this.findOne(id);
    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }

    if (dto.professor_id) {
      const professor = await this.userRepo.findOne({
        where: { user_id: dto.professor_id, role: UserRole.PROFESSOR },
      });
      if (!professor) {
        throw new NotFoundException(
          `Professor with ID ${dto.professor_id} not found`,
        );
      }
      advisory.professor = professor;
    }

    if (dto.subject_detail_id) {
      const subjectDetail = await this.subjectDetailRepo.findOne({
        where: { subject_detail_id: dto.subject_detail_id },
        relations: ['subject', 'schedules'],
      });
      if (!subjectDetail) {
        throw new NotFoundException(
          `Subject Detail with ID ${dto.subject_detail_id} not found`,
        );
      }
      advisory.subject_detail = {
        subject_detail_id: subjectDetail.subject_detail_id,
        subject_name: subjectDetail.subject.subject,
        schedules: subjectDetail.schedules.map((s) => ({
          day: s.day,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      };
    }

    if (dto.max_students) {
      advisory.max_students = dto.max_students;
    }

    if (dto.schedules) {
      // Fetch and remove existing schedules from the database
      const existingSchedules = await this.advisoryScheduleRepo.find({
        where: { advisory: { advisory_id: id } },
      });
      if (existingSchedules.length > 0) {
        await this.advisoryScheduleRepo.remove(existingSchedules);
      }

      // Add new schedules
      advisory.schedules = [];
      for (const schedule of dto.schedules) {
        const advisorySchedule = this.advisoryScheduleRepo.create(schedule);
        advisory.schedules.push(advisorySchedule);
      }
    }

    // Save the updated advisory entity, not the DTO
    await this.advisoryRepo.save({ advisory_id: id, ...dto });
    return advisory;
  }

  async findByProfessor(professorId: number): Promise<AdvisoryResponseDto[]> {
    // Verificar que el profesor existe
    const professor = await this.userRepo.findOne({
      where: { user_id: professorId, role: UserRole.PROFESSOR },
    });

    if (!professor) {
      throw new NotFoundException(
        `Professor with id ${professorId} not found or is not a professor`,
      );
    }

    // Obtener todas las asesorías del profesor con relaciones completas
    const advisories = await this.advisoryRepo.find({
      where: { professor_id: professorId },
      relations: [
        'professor',
        'subject_detail',
        'subject_detail.subject',
        'subject_detail.schedules',
        'schedules',
      ],
      order: {
        advisory_id: 'DESC', // Más recientes primero
      },
    });

    // Mapear a DTOs de respuesta
    return advisories.map((advisory) =>
      this.generateAdvisoryResponse(advisory),
    );
  }

  async remove(id: number): Promise<AdvisoryResponseDto> {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
      relations: [
        'professor',
        'subject_detail',
        'schedules',
        'subject_detail.subject',
      ],
    });
    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }
    await this.advisoryRepo.remove(advisory);
    return this.generateAdvisoryResponse(advisory);
  }

  /**
   * Crea una sesión directa de asesoría (sin solicitud previa)
   * Solo profesores pueden crear sesiones en materias que tienen asignadas
   */
  async createDirectSession(
    professorId: number,
    dto: CreateDirectSessionDto,
  ): Promise<{ advisory: AdvisoryResponseDto; advisory_date: AdvisoryDate }> {
    // 1. Validar que el profesor existe y está autorizado
    const professor = await this.userRepo.findOne({
      where: { user_id: professorId, role: UserRole.PROFESSOR },
    });
    if (!professor) {
      throw new NotFoundException(`Professor with ID ${professorId} not found`);
    }

    // 2. Validar que el subject_detail existe y el profesor está asignado
    const subjectDetail = await this.subjectDetailRepo.findOne({
      where: {
        subject_detail_id: dto.subject_detail_id,
        professor_id: professorId, // Solo puede crear sesiones de sus materias
      },
      relations: ['subject'],
    });
    if (!subjectDetail) {
      throw new ForbiddenException(
        'You can only create sessions for subjects assigned to you',
      );
    }

    // 3. Validar que el venue existe
    const venue = await this.venueRepo.findOne({
      where: { venue_id: dto.venue_id },
    });
    if (!venue) {
      throw new NotFoundException(`Venue with ID ${dto.venue_id} not found`);
    }

    // 4. Validar que la fecha no sea en el pasado
    const now = new Date();
    if (dto.session_date <= now) {
      throw new BadRequestException('Session date must be in the future');
    }

    // 5. Verificar solapamiento de horarios del profesor
    await this.validateProfessorAvailability(professorId, dto.session_date);

    // 6. Crear o encontrar Advisory existente para esta materia
    let advisory = await this.advisoryRepo.findOne({
      where: {
        professor_id: professorId,
        subject_detail_id: dto.subject_detail_id,
        status: AdvisoryStatus.ACTIVE,
      },
      relations: [
        'professor',
        'subject_detail',
        'subject_detail.subject',
        'schedules',
      ],
    });

    if (!advisory) {
      // Crear nueva Advisory
      advisory = this.advisoryRepo.create({
        professor_id: professorId,
        subject_detail_id: dto.subject_detail_id,
        max_students: dto.max_students,
        status: AdvisoryStatus.ACTIVE,
        created_by_id: professorId,
        professor: professor,
        subject_detail: subjectDetail,
      });
      advisory = await this.advisoryRepo.save(advisory);

      if (!advisory) {
        throw new Error('Error saving advisory');
      }

      // Crear schedules
      const schedules = dto.schedules.map((schedule) => {
        return this.advisoryScheduleRepo.create({
          day: schedule.day as WeekDay,
          begin_time: schedule.begin_time,
          end_time: schedule.end_time,
          advisory_id: advisory!.advisory_id,
        });
      });
      await this.advisoryScheduleRepo.save(schedules);
      advisory.schedules = schedules;
    }

    // 7. Crear AdvisoryDate (la sesión específica)
    const advisoryDate = this.advisoryDateRepo.create({
      advisory_id: advisory.advisory_id,
      venue_id: dto.venue_id,
      topic: dto.topic,
      date: dto.session_date.toISOString(),
      notes: dto.notes,
      session_link: dto.session_link,
      advisory: advisory,
    });

    const savedAdvisoryDate = await this.advisoryDateRepo.save(advisoryDate);

    // 8. Si hay estudiantes invitados, procesarlos (implementar en siguiente paso)
    if (dto.invited_student_ids && dto.invited_student_ids.length > 0) {
      this.inviteStudentsToSession(
        savedAdvisoryDate.advisory_date_id,
        dto.invited_student_ids,
      );
    }

    const advisoryResponse = this.generateAdvisoryResponse(advisory);

    return {
      advisory: advisoryResponse,
      advisory_date: savedAdvisoryDate,
    };
  }

  /**
   * Valida que el profesor no tenga conflictos de horario
   */
  private async validateProfessorAvailability(
    professorId: number,
    sessionDate: Date,
  ): Promise<void> {
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar sesiones existentes en el mismo día
    const conflictingSessions = await this.advisoryDateRepo
      .createQueryBuilder('ad')
      .innerJoin('ad.advisory', 'a')
      .where('a.professor_id = :professorId', { professorId })
      .andWhere('ad.date >= :startOfDay', {
        startOfDay: startOfDay.toISOString(),
      })
      .andWhere('ad.date <= :endOfDay', { endOfDay: endOfDay.toISOString() })
      .getCount();

    if (conflictingSessions > 0) {
      throw new BadRequestException(
        'You already have a session scheduled for this time period',
      );
    }
  }

  /**
   * Invita estudiantes específicos a una sesión
   * Implementación completa usando InvitationService
   */
  private inviteStudentsToSession(
    advisoryDateId: number,
    studentIds: number[],
  ): void {
    // Esta funcionalidad ahora se maneja a través del InvitationService
    // Se puede llamar desde el endpoint POST /advisories/sessions/:sessionId/invite
    console.log(
      `Students ${studentIds.join(', ')} can be invited to session ${advisoryDateId} using the invitation endpoints`,
    );
  }
}
