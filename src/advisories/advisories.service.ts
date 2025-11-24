import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advisory } from './entities/advisory.entity';
import { User } from '../users/entities/user.entity';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { CreateDirectSessionDto } from './dto/create-direct-session.dto';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';
import { AdvisorySchedule } from '../advisory-schedules/entities/advisory-schedule.entity';
import { AdvisoryDate } from '../advisory-dates/entities/advisory-date.entity';
import { Venue } from '../venues/entities/venue.entity';
import { UserRole } from '../users/user-role.enum';
import { AdvisoryStatus } from './advisory-status.enum';
import { AdvisoryResponseDto } from './dto/advisory-response.dto';
import { AdvisoryWithSessionsDto } from './dto/advisory-with-sessions.dto';
import { WeekDay } from '../common/week-day.enum';

@Injectable()
export class AdvisoriesService {
        /**
         * Búsqueda y ordenamiento de asesorías
         */
        async searchAdvisories(query: any) {
          const qb = this.advisoryRepo.createQueryBuilder('advisory')
            .leftJoinAndSelect('advisory.professor', 'professor')
            .leftJoinAndSelect('advisory.subject_detail', 'subject_detail')
            .leftJoinAndSelect('subject_detail.subject', 'subject')
            .leftJoinAndSelect('advisory.schedules', 'schedules')
            .leftJoinAndSelect('advisory.advisory_dates', 'advisory_dates');

          // Texto libre (materia, profesor, topic)
          if (query.q) {
            qb.andWhere('subject.subject LIKE :q OR professor.name LIKE :q OR professor.last_name LIKE :q', { q: `%${query.q}%` });
          }
          // Materia específica
          if (query.subject_id) {
            qb.andWhere('subject.subject_id = :subject_id', { subject_id: query.subject_id });
          }
          // Profesor específico
          if (query.professor_id) {
            qb.andWhere('professor.user_id = :professor_id', { professor_id: query.professor_id });
          }

          // Ordenamiento
          if (query.sort_by) {
            let sortField = 'advisory_dates.date';
            if (query.sort_by === 'subject') sortField = 'subject.subject';
            if (query.sort_by === 'professor') sortField = 'professor.name';
            if (query.sort_by === 'students') sortField = 'advisory.max_students';
            qb.orderBy(sortField, query.order || 'ASC');
          }

          return qb.getMany();
        }
      /**
       * Calcula estadísticas agregadas para un profesor
       */
      async getProfessorStats(professorId: number): Promise<any> {
        // Total de asesorías
        const totalAdvisories = await this.advisoryRepo.count({ where: { professor: { user_id: professorId } } });

        // Total de sesiones
        const advisories = await this.advisoryRepo.find({
          where: { professor: { user_id: professorId } },
          relations: ['advisory_dates', 'subject_detail', 'subject_detail.subject'],
        });
        const allSessions = advisories.flatMap(a => a.advisory_dates || []);
        const totalSessions = allSessions.length;

        // Sesiones próximas y completadas
        const now = new Date();
        const upcomingSessions = allSessions.filter(s => new Date(s.date) > now).length;
        const completedSessions = allSessions.filter(s => new Date(s.date) <= now).length;

        // Total de estudiantes atendidos
        const totalStudents = allSessions.reduce((acc, s) => acc + (s.attendances?.length || 0), 0);

        // Tasa promedio de asistencia
        let averageAttendanceRate = 0;
        if (totalSessions > 0) {
          const rates = allSessions.map(s => {
            const attended = (s.attendances || []).filter(a => a.attended).length;
            const total = s.attendances?.length || 0;
            return total > 0 ? attended / total : 0;
          });
          averageAttendanceRate = Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100);
        }

        // Sesiones por materia
        const sessionsBySubject: Record<string, number> = {};
        advisories.forEach(a => {
          const subjectName = a.subject_detail?.subject?.subject || 'Sin materia';
          sessionsBySubject[subjectName] = (sessionsBySubject[subjectName] || 0) + (a.advisory_dates?.length || 0);
        });

        // Sesiones esta semana y este mes
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const sessionsThisWeek = allSessions.filter(s => {
          const d = new Date(s.date);
          return d >= startOfWeek && d <= endOfWeek;
        }).length;
        const sessionsThisMonth = allSessions.filter(s => {
          const d = new Date(s.date);
          return d >= startOfMonth && d <= endOfMonth;
        }).length;

        return {
          totalAdvisories,
          totalSessions,
          upcomingSessions,
          completedSessions,
          totalStudents,
          averageAttendanceRate,
          sessionsBySubject,
          sessionsThisWeek,
          sessionsThisMonth,
        };
      }
    /**
     * Devuelve todas las sesiones de asesoría (advisory_dates) de un profesor
     */
    async findSessionsByProfessor(professorId: number) {
      // Buscar asesorías del profesor
      const advisories = await this.advisoryRepo.find({
        where: { professor: { user_id: professorId } },
        relations: ['advisory_dates', 'advisory_dates.venue', 'advisory_dates.attendances'],
      });
      // Extraer todas las sesiones (advisory_dates) de todas las asesorías
      const sessions = advisories.flatMap(a => a.advisory_dates || []);
      return sessions;
    }
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

  async findByProfessorWithSessions(
    professorId: number,
    includePast: boolean = true,
  ): Promise<AdvisoryWithSessionsDto[]> {
    // Verificar que el profesor existe
    const professor = await this.userRepo.findOne({
      where: { user_id: professorId, role: UserRole.PROFESSOR },
    });

    if (!professor) {
      throw new NotFoundException(
        `Professor with id ${professorId} not found or is not a professor`,
      );
    }

    // Obtener todas las asesorías del profesor con relaciones completas incluyendo sesiones
    const advisories = await this.advisoryRepo.find({
      where: { professor_id: professorId },
      relations: [
        'professor',
        'subject_detail',
        'subject_detail.subject',
        'subject_detail.schedules',
        'schedules',
        'advisory_dates',
        'advisory_dates.venue',
        'advisory_dates.attendances',
      ],
      order: {
        advisory_id: 'DESC',
        advisory_dates: {
          date: 'ASC', // Sesiones ordenadas por fecha ascendente
        },
      },
    });

    const now = new Date();

    // Mapear a DTOs con sesiones incluidas
    return advisories.map((advisory) => {
      // Filtrar sesiones si no se quieren las pasadas
      let sessions = advisory.advisory_dates || [];
      
      if (!includePast) {
        sessions = sessions.filter(
          (session) => new Date(session.date) >= now,
        );
      }

      // Mapear sesiones a DTO
      const mappedSessions = sessions.map((session) => {
        const sessionDate = new Date(session.date);
        const isUpcoming = sessionDate >= now && !session.completed_at;
        const isCompleted = !!session.completed_at;
        const attendancesCount = session.attendances?.length || 0;
        const attendedCount =
          session.attendances?.filter((a) => a.attended).length || 0;

        return {
          advisory_date_id: session.advisory_date_id,
          topic: session.topic,
          date: session.date,
          notes: session.notes,
          session_link: session.session_link,
          completed_at: session.completed_at,
          venue: {
            venue_id: session.venue.venue_id,
            building: session.venue.building || 'N/A',
            name: session.venue.name,
          },
          attendances_count: attendancesCount,
          attended_count: attendedCount,
          is_upcoming: isUpcoming,
          is_completed: isCompleted,
        };
      });

      // Calcular estadísticas de sesiones
      const totalSessions = mappedSessions.length;
      const upcomingSessions = mappedSessions.filter((s) => s.is_upcoming).length;
      const completedSessions = mappedSessions.filter((s) => s.is_completed).length;

      // Generar respuesta base de asesoría
      const baseResponse = this.generateAdvisoryResponse(advisory);

      return {
        ...baseResponse,
        sessions: mappedSessions,
        total_sessions: totalSessions,
        upcoming_sessions: upcomingSessions,
        completed_sessions: completedSessions,
      };
    });
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

  async getSessionStudents(sessionId: number) {
    // Find the advisory date (session) with all relations
    const session = await this.advisoryDateRepo.findOne({
      where: { advisory_date_id: sessionId },
      relations: [
        'advisory',
        'advisory.subject_detail',
        'advisory.subject_detail.subject',
        'advisory.subject_detail.professor',
        'venue',
        'attendances',
        'attendances.student',
      ],
    });

    if (!session) {
      throw new NotFoundException(
        `Session with ID ${sessionId} not found`,
      );
    }

    // Get all students from attendance records
    const students = session.attendances.map((attendance) => ({
      user_id: attendance.student.user_id,
      student_id: attendance.student.student_id,
      name: attendance.student.name,
      last_name: attendance.student.last_name,
      email: attendance.student.email,
      photo_url: attendance.student.photo_url,
      phone_number: attendance.student.phone_number,
      attended: attendance.attended,
      attendance_notes: attendance.notes,
      join_type: 'attendance' as const, // All students in attendance are registered
    }));

    const totalStudents = students.length;
    const attendedCount = students.filter((s) => s.attended).length;
    const absentCount = totalStudents - attendedCount;
    const attendanceRate =
      totalStudents > 0 ? (attendedCount / totalStudents) * 100 : 0;

    return {
      session: {
        advisory_date_id: session.advisory_date_id,
        advisory_id: session.advisory_id,
        topic: session.topic,
        date: session.date,
        notes: session.notes,
        session_link: session.session_link,
        venue: {
          venue_id: session.venue.venue_id,
          building: session.venue.building || 'N/A',
          classroom: session.venue.name,
          capacity: 0, // Not available in current schema
        },
        subject: {
          subject_id: session.advisory.subject_detail.subject.subject_id,
          subject_name: session.advisory.subject_detail.subject.subject,
        },
        professor: {
          user_id: session.advisory.subject_detail.professor.user_id,
          name: session.advisory.subject_detail.professor.name,
          last_name: session.advisory.subject_detail.professor.last_name,
          email: session.advisory.subject_detail.professor.email,
          photo_url: session.advisory.subject_detail.professor.photo_url,
        },
        max_students: session.advisory.max_students,
        completed_at: session.completed_at,
      },
      students,
      total_students: totalStudents,
      attended_count: attendedCount,
      absent_count: absentCount,
      attendance_rate: Math.round(attendanceRate * 100) / 100,
    };
  }

  async getFullSessionDetails(sessionId: number) {
    // Find the advisory date with ALL relations
    const session = await this.advisoryDateRepo.findOne({
      where: { advisory_date_id: sessionId },
      relations: [
        'advisory',
        'advisory.subject_detail',
        'advisory.subject_detail.subject',
        'advisory.subject_detail.professor',
        'advisory.subject_detail.schedules',
        'advisory.schedules',
        'venue',
        'attendances',
        'attendances.student',
      ],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    const now = new Date();
    const sessionDate = new Date(session.date);
    const isCompleted = !!session.completed_at;
    const isUpcoming = sessionDate > now && !isCompleted;

    const attendances = session.attendances.map((att) => ({
      student_id: att.student.user_id,
      student_enrollment_id: att.student.student_id,
      student_name: att.student.name,
      student_last_name: att.student.last_name,
      attended: att.attended,
      notes: att.notes,
    }));

    const registeredCount = attendances.length;
    const attendedCount = attendances.filter((a) => a.attended).length;
    const attendanceRate =
      registeredCount > 0 ? (attendedCount / registeredCount) * 100 : 0;

    return {
      advisory_date_id: session.advisory_date_id,
      advisory_id: session.advisory_id,
      topic: session.topic,
      date: session.date,
      notes: session.notes,
      session_link: session.session_link,
      completed_at: session.completed_at,
      created_at: session.created_at,
      updated_at: session.updated_at,
      venue: {
        venue_id: session.venue.venue_id,
        building: session.venue.building || 'N/A',
        classroom: session.venue.name,
        capacity: 0, // Not available in current schema
      },
      subject: {
        subject_id: session.advisory.subject_detail.subject.subject_id,
        subject_name: session.advisory.subject_detail.subject.subject,
        schedules: session.advisory.subject_detail.schedules.map((s) => ({
          day: s.day,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      },
      professor: {
        user_id: session.advisory.subject_detail.professor.user_id,
        name: session.advisory.subject_detail.professor.name,
        last_name: session.advisory.subject_detail.professor.last_name,
        email: session.advisory.subject_detail.professor.email,
        photo_url: session.advisory.subject_detail.professor.photo_url,
        phone_number: session.advisory.subject_detail.professor.phone_number,
      },
      max_students: session.advisory.max_students,
      advisory_schedules: session.advisory.schedules.map((s) => ({
        advisory_schedule_id: s.advisory_schedule_id,
        day: s.day,
        begin_time: s.begin_time,
        end_time: s.end_time,
      })),
      attendances,
      registered_students_count: registeredCount,
      attended_count: attendedCount,
      attendance_rate: Math.round(attendanceRate * 100) / 100,
      is_completed: isCompleted,
      is_upcoming: isUpcoming,
    };
  }
}


