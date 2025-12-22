import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from './entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Advisory } from '../advisories/entities/advisory.entity';
import { AdvisoryDate } from '../advisory-dates/entities/advisory-date.entity';
import { AdvisoryRequest } from '../advisory-requests/entities/advisory-request.entity';
import { AdvisoryAttendance } from '../advisory-attendance/entities/advisory-attendance.entity';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';
import { RequestStatus } from '../advisory-requests/request-status.enum';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminDashboardStatsDto } from './dto/admin-dashboard-stats.dto';
import { ProfessorDashboardStatsDto } from './dto/professor-dashboard-stats.dto';
import { StudentDashboardStatsDto } from './dto/student-dashboard-stats.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Advisory)
    private readonly advisoryRepo: Repository<Advisory>,
    @InjectRepository(AdvisoryDate)
    private readonly advisoryDateRepo: Repository<AdvisoryDate>,
    @InjectRepository(AdvisoryRequest)
    private readonly advisoryRequestRepo: Repository<AdvisoryRequest>,
    @InjectRepository(AdvisoryAttendance)
    private readonly attendanceRepo: Repository<AdvisoryAttendance>,
    @InjectRepository(SubjectDetails)
    private readonly subjectDetailsRepo: Repository<SubjectDetails>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ username });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.usersRepo.create({
      ...dto,
      password: hashedPassword,
    });

    return this.usersRepo.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepo.findOneBy({ user_id: id });
    if (!user) {
      throw new NotFoundException(
        `El usuario con el id "${id}" no fue encontrado`,
      );
    }
    return user;
  }

  async findByRole(role: UserRole) {
    // Respuesta consistente para todos los roles - solo datos básicos de usuario
    // Para relaciones específicas usar endpoints dedicados como /subject-details/professor/:id
    return this.usersRepo.find({
      where: { role },
      select: [
        'user_id',
        'name',
        'last_name',
        'email',
        'phone_number',
        'username',
        'photo_url',
        'school_id',
        'student_id',
        'employee_id',
        'role',
      ],
    });
  }

  async findStudentSubjects(studentId: number) {
    // Obtener las materias en las que está inscrito un estudiante específico
    // a través de sus asesorías programadas
    const student = await this.usersRepo.findOne({
      where: { user_id: studentId, role: UserRole.STUDENT },
      relations: [
        'attendances',
        'attendances.advisory_date',
        'attendances.advisory_date.advisory',
        'attendances.advisory_date.advisory.subject_detail',
        'attendances.advisory_date.advisory.subject_detail.subject',
        'attendances.advisory_date.advisory.subject_detail.professor',
      ],
    });

    if (!student) {
      throw new NotFoundException(
        `Estudiante con ID ${studentId} no encontrado`,
      );
    }

    // Extraer y organizar las materias únicas
    type SubjectMapValue = {
      subject_detail_id: number;
      subject: Subject;
      professor: {
        user_id: number;
        name: string;
        last_name: string;
        email: string;
        photo_url?: string | null;
      };
      advisories_count: number;
    };

    const subjectsMap = new Map<string, SubjectMapValue>();

    student.attendances.forEach((attendance) => {
      const advisory = attendance.advisory_date?.advisory;
      if (advisory?.subject_detail) {
        const subjectDetail = advisory.subject_detail;
        const key = `${subjectDetail.subject_id}-${subjectDetail.professor_id}`;

        if (!subjectsMap.has(key)) {
          subjectsMap.set(key, {
            subject_detail_id: subjectDetail.subject_detail_id,
            subject: subjectDetail.subject,
            professor: {
              user_id: subjectDetail.professor.user_id,
              name: subjectDetail.professor.name,
              last_name: subjectDetail.professor.last_name,
              email: subjectDetail.professor.email,
              photo_url: subjectDetail.professor.photo_url,
            },
            advisories_count: 0,
          });
        }

        // Incrementar contador de asesorías
        const subjectInfo = subjectsMap.get(key);
        if (subjectInfo) {
          subjectInfo.advisories_count += 1;
        }
      }
    });

    return {
      student: {
        user_id: student.user_id,
        name: student.name,
        last_name: student.last_name,
        email: student.email,
        student_id: student.student_id,
      },
      enrolled_subjects: Array.from(subjectsMap.values()),
    };
  }

  async updateRole(id: number, role: UserRole) {
    const user = await this.usersRepo.findOneBy({ user_id: id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.role = role;
    return this.usersRepo.save(user);
  }

  async update(id: number, dto: Partial<CreateUserDto>) {
    const user = await this.usersRepo.findOneBy({ user_id: id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verificar si email ya existe en otro usuario (excluir el usuario actual)
    if (dto.email && dto.email !== user.email) {
      const existingUserByEmail = await this.usersRepo
        .createQueryBuilder('user')
        .where('user.email = :email', { email: dto.email })
        .andWhere('user.user_id != :userId', { userId: id })
        .getOne();

      if (existingUserByEmail) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    // Verificar si username ya existe en otro usuario (excluir el usuario actual)
    if (dto.username && dto.username !== user.username) {
      const existingUserByUsername = await this.usersRepo
        .createQueryBuilder('user')
        .where('user.username = :username', { username: dto.username })
        .andWhere('user.user_id != :userId', { userId: id })
        .getOne();

      if (existingUserByUsername) {
        throw new ConflictException(
          'El nombre de usuario ya está en uso por otro usuario',
        );
      }
    }

    // Verificar si phone_number ya existe en otro usuario (excluir el usuario actual)
    if (dto.phone_number && dto.phone_number !== user.phone_number) {
      const existingUserByPhone = await this.usersRepo
        .createQueryBuilder('user')
        .where('user.phone_number = :phoneNumber', {
          phoneNumber: dto.phone_number,
        })
        .andWhere('user.user_id != :userId', { userId: id })
        .getOne();

      if (existingUserByPhone) {
        throw new ConflictException(
          'El número de teléfono ya está en uso por otro usuario',
        );
      }
    }

    // Hash de la contraseña si se proporciona
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // Actualizar solo los campos que han cambiado
    const updateData: Partial<User> = {};

    // Solo incluir campos que realmente cambiaron
    if (dto.name && dto.name !== user.name) updateData.name = dto.name;
    if (dto.last_name && dto.last_name !== user.last_name)
      updateData.last_name = dto.last_name;
    if (dto.email && dto.email !== user.email) updateData.email = dto.email;
    if (dto.phone_number && dto.phone_number !== user.phone_number)
      updateData.phone_number = dto.phone_number;
    if (dto.username && dto.username !== user.username)
      updateData.username = dto.username;
    if (dto.password) updateData.password = dto.password;
    if (dto.photo_url !== undefined && dto.photo_url !== user.photo_url)
      updateData.photo_url = dto.photo_url;
    if (dto.school_id !== undefined && dto.school_id !== user.school_id)
      updateData.school_id = dto.school_id;
    if (dto.role && dto.role !== user.role) updateData.role = dto.role;

    // Si no hay cambios, devolver el usuario actual
    if (Object.keys(updateData).length === 0) {
      return user;
    }

    // Usar update en lugar de save para evitar problemas con constraints
    await this.usersRepo.update(id, updateData);

    // Retornar el usuario actualizado
    return this.usersRepo.findOneBy({ user_id: id });
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStatsDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // User Stats
    const totalUsers = await this.usersRepo.count();
    const students = await this.usersRepo.count({
      where: { role: UserRole.STUDENT },
    });
    const professors = await this.usersRepo.count({
      where: { role: UserRole.PROFESSOR },
    });
    const admins = await this.usersRepo.count({
      where: { role: UserRole.ADMIN },
    });
    const recentRegistrations = await this.usersRepo.count({
      where: {
        created_at: MoreThan(thirtyDaysAgo),
      },
    });

    // Advisory Stats
    const totalAdvisories = await this.advisoryRepo.count();
    const advisoriesWithDates = await this.advisoryRepo
      .createQueryBuilder('advisory')
      .leftJoin('advisory.advisory_dates', 'dates')
      .select('advisory.advisory_id')
      .addSelect('COUNT(dates.advisory_date_id)', 'dates_count')
      .addSelect('MAX(dates.date)', 'latest_date')
      .groupBy('advisory.advisory_id')
      .getRawMany();

    const activeAdvisories = advisoriesWithDates.filter((a) => {
      const latestDate = a.latest_date ? new Date(a.latest_date) : null;
      return latestDate && latestDate >= now;
    }).length;

    const completedAdvisories = advisoriesWithDates.filter((a) => {
      const latestDate = a.latest_date ? new Date(a.latest_date) : null;
      return latestDate && latestDate < now;
    }).length;

    // Calculate avg students per session
    const attendanceBySession = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .select('attendance.advisory_date_id')
      .addSelect('COUNT(DISTINCT attendance.student_id)', 'student_count')
      .groupBy('attendance.advisory_date_id')
      .getRawMany();

    const avgStudentsPerSession =
      attendanceBySession.length > 0
        ? attendanceBySession.reduce(
            (sum, s) => sum + parseInt(s.student_count, 10),
            0,
          ) / attendanceBySession.length
        : 0;

    // Session Stats (Advisory Dates)
    const totalSessions = await this.advisoryDateRepo.count();

    const upcomingSessions = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .where('date.date >= :now', { now: now.toISOString() })
      .andWhere('date.completed_at IS NULL')
      .getCount();

    const completedSessions = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .where('date.completed_at IS NOT NULL')
      .getCount();

    const thisWeekSessions = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .where('date.date >= :startOfWeek', {
        startOfWeek: startOfWeek.toISOString(),
      })
      .andWhere('date.date < :endOfWeek', {
        endOfWeek: endOfWeek.toISOString(),
      })
      .getCount();

    const thisMonthSessions = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .where('date.date >= :startOfMonth', {
        startOfMonth: startOfMonth.toISOString(),
      })
      .andWhere('date.date <= :endOfMonth', {
        endOfMonth: endOfMonth.toISOString(),
      })
      .getCount();

    // Request Stats
    const totalRequests = await this.advisoryRequestRepo.count();
    const pendingRequests = await this.advisoryRequestRepo.count({
      where: { status: RequestStatus.PENDING },
    });
    const approvedRequests = await this.advisoryRequestRepo.count({
      where: { status: RequestStatus.APPROVED },
    });
    const rejectedRequests = await this.advisoryRequestRepo.count({
      where: { status: RequestStatus.REJECTED },
    });

    // Calculate average response time
    const processedRequests = await this.advisoryRequestRepo
      .createQueryBuilder('request')
      .select('request.created_at', 'created_at')
      .addSelect('request.processed_at', 'processed_at')
      .where('request.processed_at IS NOT NULL')
      .getRawMany();

    let avgResponseTimeHours = 0;
    if (processedRequests.length > 0) {
      const totalResponseTime = processedRequests.reduce((sum, req) => {
        const created = new Date(req.created_at).getTime();
        const processed = new Date(req.processed_at).getTime();
        return sum + (processed - created);
      }, 0);
      avgResponseTimeHours =
        totalResponseTime / processedRequests.length / (1000 * 60 * 60);
    }

    // Attendance Stats
    const totalAttendanceRecords = await this.attendanceRepo.count();
    const attendedRecords = await this.attendanceRepo.count({
      where: { attended: true },
    });
    const attendanceRate =
      totalAttendanceRecords > 0
        ? (attendedRecords / totalAttendanceRecords) * 100
        : 0;

    // Subject Stats
    const totalSubjects = await this.subjectRepo.count();
    const subjectsWithProfessors = await this.subjectDetailsRepo
      .createQueryBuilder('sd')
      .select('COUNT(DISTINCT sd.subject_id)', 'count')
      .getRawOne();

    const activeAdvisoriesCount = await this.advisoryRepo
      .createQueryBuilder('advisory')
      .innerJoin('advisory.advisory_dates', 'dates')
      .where('dates.date >= :now', { now: now.toISOString() })
      .getCount();

    // Top Subjects
    const topSubjectsRaw = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .innerJoin('date.advisory', 'advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .innerJoin('sd.subject', 'subject')
      .leftJoin('date.attendances', 'attendance')
      .select('subject.subject_id', 'subject_id')
      .addSelect('subject.subject', 'subject_name')
      .addSelect('COUNT(DISTINCT date.advisory_date_id)', 'sessions_count')
      .addSelect('COUNT(DISTINCT attendance.student_id)', 'students_served')
      .groupBy('subject.subject_id')
      .addGroupBy('subject.subject')
      .orderBy('sessions_count', 'DESC')
      .limit(5)
      .getRawMany();

    const topSubjects = topSubjectsRaw.map((s) => ({
      subject_id: s.subject_id,
      subject_name: s.subject_name,
      sessions_count: parseInt(s.sessions_count, 10),
      students_served: parseInt(s.students_served, 10),
    }));

    // Top Professors
    const topProfessorsRaw = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .innerJoin('date.advisory', 'advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .innerJoin('sd.professor', 'professor')
      .leftJoin('date.attendances', 'attendance')
      .select('professor.user_id', 'user_id')
      .addSelect('professor.name', 'name')
      .addSelect('professor.last_name', 'last_name')
      .addSelect('COUNT(DISTINCT date.advisory_date_id)', 'sessions_count')
      .addSelect('COUNT(DISTINCT attendance.student_id)', 'students_served')
      .groupBy('professor.user_id')
      .addGroupBy('professor.name')
      .addGroupBy('professor.last_name')
      .orderBy('sessions_count', 'DESC')
      .limit(5)
      .getRawMany();

    const topProfessors = topProfessorsRaw.map((p) => ({
      user_id: p.user_id,
      name: p.name,
      last_name: p.last_name,
      sessions_count: parseInt(p.sessions_count, 10),
      students_served: parseInt(p.students_served, 10),
      avg_rating: 0, // Placeholder - implement ratings system later
    }));

    return {
      users: {
        total: totalUsers,
        students,
        professors,
        admins,
        recent_registrations: recentRegistrations,
      },
      advisories: {
        total: totalAdvisories,
        active: activeAdvisories,
        completed: completedAdvisories,
        avg_students_per_session: Math.round(avgStudentsPerSession * 100) / 100,
      },
      sessions: {
        total: totalSessions,
        upcoming: upcomingSessions,
        completed: completedSessions,
        this_week: thisWeekSessions,
        this_month: thisMonthSessions,
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        avg_response_time_hours: Math.round(avgResponseTimeHours * 100) / 100,
      },
      attendance: {
        total_records: totalAttendanceRecords,
        attended: attendedRecords,
        attendance_rate: Math.round(attendanceRate * 100) / 100,
      },
      subjects: {
        total: totalSubjects,
        with_professors: parseInt(subjectsWithProfessors?.count || '0', 10),
        active_advisories: activeAdvisoriesCount,
      },
      top_subjects: topSubjects,
      top_professors: topProfessors,
    };
  }

  async getProfessorDashboardStats(
    professorId: number,
  ): Promise<ProfessorDashboardStatsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // Verify professor exists
    const professor = await this.usersRepo.findOne({
      where: { user_id: professorId, role: UserRole.PROFESSOR },
    });

    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Get professor's subject details
    const subjectDetails = await this.subjectDetailsRepo.find({
      where: { professor_id: professorId },
      relations: ['subject', 'advisories', 'advisories.advisory_dates'],
    });

    // Get all advisories for this professor
    const professorAdvisories = await this.advisoryRepo
      .createQueryBuilder('advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .leftJoinAndSelect('advisory.advisory_dates', 'dates')
      .where('sd.professor_id = :professorId', { professorId })
      .getMany();

    // Count active advisories (have future dates)
    const activeAdvisories = professorAdvisories.filter((advisory) => {
      return advisory.advisory_dates?.some(
        (date) => new Date(date.date) >= now,
      );
    });

    // Count upcoming sessions
    const upcomingSessions = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .innerJoin('date.advisory', 'advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .where('sd.professor_id = :professorId', { professorId })
      .andWhere('date.date >= :now', { now: now.toISOString() })
      .andWhere('date.completed_at IS NULL')
      .getCount();

    // Count pending requests for professor's subjects
    const pendingRequests = await this.advisoryRequestRepo
      .createQueryBuilder('request')
      .innerJoin('request.subject_detail', 'sd')
      .where('sd.professor_id = :professorId', { professorId })
      .andWhere('request.status = :status', { status: RequestStatus.PENDING })
      .getCount();

    // Count students helped this month
    const studentsHelpedThisMonth = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .innerJoin('attendance.advisory_date', 'date')
      .innerJoin('date.advisory', 'advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .where('sd.professor_id = :professorId', { professorId })
      .andWhere('date.date >= :startOfMonth', {
        startOfMonth: startOfMonth.toISOString(),
      })
      .andWhere('date.date <= :endOfMonth', {
        endOfMonth: endOfMonth.toISOString(),
      })
      .andWhere('attendance.attended = :attended', { attended: true })
      .select('COUNT(DISTINCT attendance.student_id)', 'count')
      .getRawOne();

    // Get last 5 advisories with their details
    const lastAdvisoriesData = await this.advisoryRepo
      .createQueryBuilder('advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .innerJoin('sd.subject', 'subject')
      .leftJoin('advisory.advisory_dates', 'dates')
      .leftJoin('dates.attendances', 'attendances')
      .where('sd.professor_id = :professorId', { professorId })
      .select([
        'advisory.advisory_id',
        'dates.topic',
        'subject.subject',
        'dates.date',
        'dates.advisory_date_id',
        'dates.completed_at',
      ])
      .addSelect('COUNT(DISTINCT attendances.student_id)', 'enrolled_count')
      .groupBy('advisory.advisory_id')
      .addGroupBy('dates.topic')
      .addGroupBy('subject.subject')
      .addGroupBy('dates.date')
      .addGroupBy('dates.advisory_date_id')
      .addGroupBy('dates.completed_at')
      .orderBy('dates.date', 'DESC')
      .limit(5)
      .getRawMany();

    // Format last advisories
    const advisoriesMap = new Map();
    lastAdvisoriesData.forEach((row) => {
      const advisoryId = row.advisory_advisory_id;
      if (!advisoriesMap.has(advisoryId)) {
        advisoriesMap.set(advisoryId, {
          advisory_id: advisoryId,
          title: row.dates_topic || `Advisory ${advisoryId}`,
          subject_name: row.subject_subject,
          next_session_date: null,
          enrolled_students: 0,
          completed_sessions: 0,
        });
      }

      const advisory = advisoriesMap.get(advisoryId);
      const sessionDate = row.dates_date ? new Date(row.dates_date) : null;

      if (row.dates_completed_at) {
        advisory.completed_sessions++;
      }

      if (sessionDate && sessionDate >= now && !advisory.next_session_date) {
        advisory.next_session_date = row.dates_date;
      }

      advisory.enrolled_students = Math.max(
        advisory.enrolled_students,
        parseInt(row.enrolled_count || '0', 10),
      );
    });

    const lastAdvisories = Array.from(advisoriesMap.values()).slice(0, 5);

    // Get total subjects taught
    const totalSubjects = subjectDetails.length;

    // Calculate total hours this semester (completed sessions * average 2 hours)
    const completedSessions = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .innerJoin('date.advisory', 'advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .where('sd.professor_id = :professorId', { professorId })
      .andWhere('date.completed_at IS NOT NULL')
      .getCount();

    const totalHoursThisSemester = completedSessions * 2; // Assuming 2 hours per session

    // Get total students helped (all time)
    const totalStudentsHelped = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .innerJoin('attendance.advisory_date', 'date')
      .innerJoin('date.advisory', 'advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .where('sd.professor_id = :professorId', { professorId })
      .andWhere('attendance.attended = :attended', { attended: true })
      .select('COUNT(DISTINCT attendance.student_id)', 'count')
      .getRawOne();

    // Calculate completion rate
    const totalSessionsScheduled = await this.advisoryDateRepo
      .createQueryBuilder('date')
      .innerJoin('date.advisory', 'advisory')
      .innerJoin('advisory.subject_detail', 'sd')
      .where('sd.professor_id = :professorId', { professorId })
      .andWhere('date.date < :now', { now: now.toISOString() })
      .getCount();

    const completionRate =
      totalSessionsScheduled > 0
        ? (completedSessions / totalSessionsScheduled) * 100
        : 100;

    return {
      overview: {
        total_active_advisories: activeAdvisories.length,
        pending_requests: pendingRequests,
        students_helped_this_month: parseInt(
          studentsHelpedThisMonth?.count || '0',
          10,
        ),
        upcoming_sessions: upcomingSessions,
      },
      recent_activity: {
        last_advisories: lastAdvisories,
        next_availability_slot: null, // TODO: Implement if professor_availability is available
      },
      statistics: {
        total_subjects: totalSubjects,
        total_hours_this_semester: totalHoursThisSemester,
        average_rating: 0, // TODO: Implement rating system
        completion_rate: Math.round(completionRate * 100) / 100,
        total_students_helped: parseInt(totalStudentsHelped?.count || '0', 10),
      },
    };
  }

  async getStudentDashboardStats(
    studentId: number,
  ): Promise<StudentDashboardStatsDto> {
    try {
      const now = new Date();

      // Verify student exists
      const student = await this.usersRepo.findOne({
        where: { user_id: studentId, role: UserRole.STUDENT },
      });

      if (!student) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      // Get student's attendance records
      const attendanceRecords = await this.attendanceRepo.find({
        where: { student_id: studentId },
        relations: [
          'advisory_date',
          'advisory_date.advisory',
          'advisory_date.advisory.subject_detail',
          'advisory_date.advisory.subject_detail.subject',
          'advisory_date.advisory.subject_detail.professor',
          'advisory_date.venue',
        ],
      });

      // Get active advisories (have future dates and student attended at least once)
      const activeAdvisoriesSet = new Set<number>();
      const completedAdvisoriesSet = new Set<number>();

      attendanceRecords.forEach((attendance) => {
        const advisoryDate = attendance.advisory_date;
        if (!advisoryDate || !advisoryDate.advisory) return;

        const sessionDate = new Date(advisoryDate.date);
        const advisoryId = advisoryDate.advisory.advisory_id;

        if (sessionDate >= now) {
          activeAdvisoriesSet.add(advisoryId);
        } else if (advisoryDate.completed_at) {
          completedAdvisoriesSet.add(advisoryId);
        }
      });

      // Get pending requests
      const pendingRequests = await this.advisoryRequestRepo.count({
        where: {
          student_id: studentId,
          status: RequestStatus.PENDING,
        },
      });

      // Find next advisory
      const nextAdvisoryAttendance = attendanceRecords
        .filter((a) => a.advisory_date && new Date(a.advisory_date.date) >= now)
        .sort(
          (a, b) =>
            new Date(a.advisory_date.date).getTime() -
            new Date(b.advisory_date.date).getTime(),
        )[0];

      let nextAdvisory: {
        advisory_id: number;
        title: string;
        subject_name: string;
        professor_name: string;
        next_session_date: string;
        venue: string;
      } | null = null;

      if (nextAdvisoryAttendance?.advisory_date) {
        const advDate = nextAdvisoryAttendance.advisory_date;
        const adv = advDate.advisory;
        const prof = adv?.subject_detail?.professor;
        nextAdvisory = {
          advisory_id: adv?.advisory_id || 0,
          title: advDate.topic,
          subject_name: adv?.subject_detail?.subject?.subject || 'N/A',
          professor_name: prof ? `${prof.name} ${prof.last_name}` : 'N/A',
          next_session_date: advDate.date,
          venue: advDate.venue?.name || 'N/A',
        };
      }

      // Get recent advisories with attendance stats
      const advisoryStatsMap = new Map();

      attendanceRecords.forEach((attendance) => {
        const advisoryDate = attendance.advisory_date;
        if (!advisoryDate || !advisoryDate.advisory) return;

        const advisory = advisoryDate.advisory;
        const advisoryId = advisory.advisory_id;
        const sessionDate = new Date(advisoryDate.date);

        if (!advisoryStatsMap.has(advisoryId)) {
          const prof = advisory.subject_detail?.professor;
          advisoryStatsMap.set(advisoryId, {
            advisory_id: advisoryId,
            title: advisoryDate.topic || `Advisory ${advisoryId}`,
            subject_name: advisory.subject_detail?.subject?.subject || 'N/A',
            professor_name: prof ? `${prof.name} ${prof.last_name}` : 'N/A',
            last_attended_date: null,
            sessions_attended: 0,
            total_sessions: 0,
            attendance_percentage: 0,
          });
        }

        const stats = advisoryStatsMap.get(advisoryId);
        stats.total_sessions++;

        if (attendance.attended) {
          stats.sessions_attended++;
          if (
            !stats.last_attended_date ||
            sessionDate > new Date(stats.last_attended_date)
          ) {
            stats.last_attended_date = advisoryDate.date;
          }
        }

        stats.attendance_percentage =
          stats.total_sessions > 0
            ? (stats.sessions_attended / stats.total_sessions) * 100
            : 0;
      });

      const recentAdvisories = Array.from(advisoryStatsMap.values())
        .sort((a, b) => {
          const dateA = a.last_attended_date
            ? new Date(a.last_attended_date).getTime()
            : 0;
          const dateB = b.last_attended_date
            ? new Date(b.last_attended_date).getTime()
            : 0;
          return dateB - dateA;
        })
        .slice(0, 5);

      // Get available professors with their subjects
      const availableProfessors = await this.subjectDetailsRepo
        .createQueryBuilder('sd')
        .innerJoinAndSelect('sd.professor', 'professor')
        .innerJoinAndSelect('sd.subject', 'subject')
        .leftJoin('sd.advisories', 'advisory')
        .leftJoin('advisory.advisory_dates', 'dates')
        .where('dates.date >= :now OR dates.date IS NULL', {
          now: now.toISOString(),
        })
        .andWhere('sd.is_active = :isActive', { isActive: true })
        .select([
          'professor.user_id',
          'professor.name',
          'professor.last_name',
          'professor.photo_url',
          'subject.subject',
        ])
        .addSelect(
          'COUNT(DISTINCT CASE WHEN dates.date >= :now THEN advisory.advisory_id END)',
          'advisory_count',
        )
        .groupBy('professor.user_id')
        .addGroupBy('professor.name')
        .addGroupBy('professor.last_name')
        .addGroupBy('professor.photo_url')
        .addGroupBy('subject.subject')
        .orderBy('advisory_count', 'DESC')
        .limit(10)
        .getRawMany();

      const availableProfessorsFormatted = availableProfessors.map((p) => ({
        user_id: p.professor_user_id,
        name: p.professor_name,
        last_name: p.professor_last_name,
        photo_url: p.professor_photo_url,
        subject: p.subject_subject,
        available_advisories: parseInt(p.advisory_count || '0', 10),
      }));

      // Calculate statistics
      const totalAdvisoriesAttended = attendanceRecords.filter(
        (a) => a.attended,
      ).length;

      const subjectsCovered = Array.from(
        new Set(
          attendanceRecords
            .filter(
              (a) =>
                a.attended &&
                a.advisory_date?.advisory?.subject_detail?.subject,
            )
            .map(
              (a) =>
                a.advisory_date?.advisory?.subject_detail?.subject?.subject,
            )
            .filter((subject): subject is string => subject !== undefined),
        ),
      );

      const totalHoursReceived = totalAdvisoriesAttended * 2; // Assuming 2 hours per session

      const totalAttendanceRecords = attendanceRecords.length;
      const attendedRecords = attendanceRecords.filter(
        (a) => a.attended,
      ).length;
      const averageAttendanceRate =
        totalAttendanceRecords > 0
          ? (attendedRecords / totalAttendanceRecords) * 100
          : 0;

      return {
        overview: {
          active_advisories: activeAdvisoriesSet.size,
          completed_advisories: completedAdvisoriesSet.size,
          pending_requests: pendingRequests,
          next_advisory: nextAdvisory,
        },
        recent_activity: {
          recent_advisories: recentAdvisories,
          available_professors: availableProfessorsFormatted,
        },
        statistics: {
          total_advisories_attended: totalAdvisoriesAttended,
          subjects_covered: subjectsCovered,
          total_hours_received: totalHoursReceived,
          average_attendance_rate:
            Math.round(averageAttendanceRate * 100) / 100,
        },
      };
    } catch (error) {
      // Log the error for debugging
      console.error('Error getting student dashboard stats:', error);

      // If it's a NotFoundException, rethrow it
      if (error instanceof NotFoundException) {
        throw error;
      }

      // For other errors, throw a generic error with details
      throw new Error(
        `Error al obtener estadísticas del estudiante: ${error.message}`,
      );
    }
  }
}
