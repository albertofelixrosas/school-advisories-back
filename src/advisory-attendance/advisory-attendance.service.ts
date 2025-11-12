import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvisoryAttendance } from './entities/advisory-attendance.entity';
import { CreateAdvisoryAttendanceDto } from './dto/create-advisory-attendance.dto';
import { UpdateAdvisoryAttendanceDto } from './dto/update-advisory-attendance.dto';
import {
  BulkAttendanceDto,
  CompleteSessionDto,
} from './dto/bulk-attendance.dto';
import { AdvisoryDate } from '../advisory-dates/entities/advisory-date.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';

@Injectable()
export class AdvisoryAttendanceService {
  constructor(
    @InjectRepository(AdvisoryAttendance)
    private attendanceRepo: Repository<AdvisoryAttendance>,
    @InjectRepository(AdvisoryDate)
    private advisoryDateRepo: Repository<AdvisoryDate>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateAdvisoryAttendanceDto) {
    // Check if attendance already exists for the student on the same advisory date
    const existingAttendance = await this.attendanceRepo.findOne({
      where: {
        student_id: dto.student_id,
        advisory_date_id: dto.advisory_date_id,
      },
    });
    if (existingAttendance) {
      throw new BadRequestException(
        'Attendance already exists for this student on this date.',
      );
    }

    // Create new attendance record
    const attendance = this.attendanceRepo.create(dto);
    return this.attendanceRepo.save(attendance);
  }

  findAll() {
    return this.attendanceRepo.find({
      relations: ['student', 'advisory_date'],
    });
  }

  async findByAdvisory(advisory_date_id: number) {
    // Check if the advisory date exists
    const advisoryDateExists = await this.attendanceRepo.manager
      .getRepository('AdvisoryDate')
      .findOne({ where: { advisory_date_id } });
    if (!advisoryDateExists) {
      throw new NotFoundException('Advisory date not found.');
    }
    // Find all attendances for the given advisory date id
    const attendances = await this.attendanceRepo.find({
      where: { advisory_date_id },
      relations: ['student'],
    });
    if (attendances.length === 0) {
      throw new NotFoundException(
        'No attendances found for this advisory date.',
      );
    }
    // Return the attendances for the advisory date
    return attendances;
  }

  async findOne(id: number) {
    // Check if the attendance record exists
    const attendance = await this.attendanceRepo.findOne({
      where: { advisory_attendance_id: id },
      relations: ['student', 'advisory_date'],
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found.');
    }
    // Return the attendance record with relations
    return attendance;
  }

  async update(id: number, dto: UpdateAdvisoryAttendanceDto) {
    // Check if the attendance record exists
    const attendance = await this.attendanceRepo.findOne({
      where: { advisory_attendance_id: id },
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found.');
    }

    // Update the attendance record
    // Note: UpdateAdvisoryAttendanceDto should have properties to update
    return this.attendanceRepo.update(id, dto);
  }

  async remove(id: number) {
    // Check if the attendance record exists
    const attendance = await this.attendanceRepo.findOne({
      where: { advisory_attendance_id: id },
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found.');
    }
    // Remove the attendance record
    return this.attendanceRepo.delete(id);
  }

  /**
   * Marca asistencia de múltiples estudiantes a la vez
   */
  async markBulkAttendance(
    advisoryDateId: number,
    dto: BulkAttendanceDto,
    professorId: number,
  ): Promise<AdvisoryAttendance[]> {
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
        'You can only mark attendance for your own sessions',
      );
    }

    // 2. Validar que los estudiantes existen
    const studentIds = dto.attendances.map((a) => a.student_id);
    const validStudents = await this.userRepo.find({
      where: studentIds.map((id) => ({ user_id: id, role: UserRole.STUDENT })),
    });

    if (validStudents.length !== studentIds.length) {
      throw new BadRequestException(
        'One or more students not found or not valid students',
      );
    }

    // 3. Procesar cada asistencia
    const results: AdvisoryAttendance[] = [];

    for (const attendanceData of dto.attendances) {
      // Verificar si ya existe registro de asistencia
      let attendance = await this.attendanceRepo.findOne({
        where: {
          student_id: attendanceData.student_id,
          advisory_date_id: advisoryDateId,
        },
      });

      if (attendance) {
        // Actualizar registro existente
        attendance.attended = attendanceData.attended;
        attendance.notes = attendanceData.notes || '';
      } else {
        // Crear nuevo registro
        attendance = this.attendanceRepo.create({
          student_id: attendanceData.student_id,
          advisory_date_id: advisoryDateId,
          attended: attendanceData.attended,
          notes: attendanceData.notes,
        });
      }

      const saved = await this.attendanceRepo.save(attendance);
      results.push(saved);
    }

    return results;
  }

  /**
   * Completa una sesión de asesoría con notas finales
   */
  async completeSession(
    advisoryDateId: number,
    dto: CompleteSessionDto,
    professorId: number,
  ): Promise<AdvisoryDate> {
    // 1. Validar que la sesión existe y el profesor está autorizado
    const advisoryDate = await this.advisoryDateRepo.findOne({
      where: { advisory_date_id: advisoryDateId },
      relations: ['advisory', 'advisory.professor'],
    });

    if (!advisoryDate) {
      throw new NotFoundException('Advisory session not found');
    }

    if (advisoryDate.advisory.professor.user_id !== professorId) {
      throw new ForbiddenException('You can only complete your own sessions');
    }

    if (advisoryDate.completed_at) {
      throw new BadRequestException('Session is already completed');
    }

    // 2. Si se proporcionan asistencias finales, procesarlas
    if (dto.final_attendances && dto.final_attendances.length > 0) {
      await this.markBulkAttendance(
        advisoryDateId,
        { attendances: dto.final_attendances },
        professorId,
      );
    }

    // 3. Marcar sesión como completada
    advisoryDate.notes = dto.session_notes;
    advisoryDate.completed_at = new Date();

    return await this.advisoryDateRepo.save(advisoryDate);
  }

  /**
   * Obtiene el reporte de asistencia de una sesión
   */
  async getSessionAttendanceReport(advisoryDateId: number): Promise<{
    session: AdvisoryDate;
    total_registered: number;
    total_attended: number;
    attendance_rate: number;
    attendances: AdvisoryAttendance[];
  }> {
    const session = await this.advisoryDateRepo.findOne({
      where: { advisory_date_id: advisoryDateId },
      relations: ['advisory', 'advisory.professor', 'advisory.subject_detail'],
    });

    if (!session) {
      throw new NotFoundException('Advisory session not found');
    }

    const attendances = await this.attendanceRepo.find({
      where: { advisory_date_id: advisoryDateId },
      relations: ['student'],
    });

    const totalRegistered = attendances.length;
    const totalAttended = attendances.filter((a) => a.attended).length;
    const attendanceRate =
      totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

    return {
      session,
      total_registered: totalRegistered,
      total_attended: totalAttended,
      attendance_rate: Math.round(attendanceRate * 100) / 100, // 2 decimales
      attendances,
    };
  }
}
