import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';
import {
  BaseUserInfoDto,
  StudentProfileResponseDto,
  ProfessorProfileResponseDto,
  AdminProfileResponseDto,
  StudentProfileDto,
  StudentStatisticsDto,
  RecentActivityDto,
  ProfessorProfileDto,
  AssignedSubjectsDto,
  ProfessorStatisticsDto,
  AvailabilityDto,
  AdminProfileDto,
  SystemInfoDto,
} from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async getUserProfile(
    userId: number,
  ): Promise<
    | StudentProfileResponseDto
    | ProfessorProfileResponseDto
    | AdminProfileResponseDto
  > {
    const user = await this.usersRepo.findOne({
      where: { user_id: userId },
      relations: ['subject_details', 'attendances', 'advisories'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const baseUserInfo = this.mapToBaseUserInfo(user);

    switch (user.role) {
      case UserRole.STUDENT:
        return await this.buildStudentProfile(user, baseUserInfo);

      case UserRole.PROFESSOR:
        return await this.buildProfessorProfile(user, baseUserInfo);

      case UserRole.ADMIN:
        return await this.buildAdminProfile(user, baseUserInfo);

      default:
        throw new NotFoundException('Rol de usuario no válido');
    }
  }

  private mapToBaseUserInfo(user: User): BaseUserInfoDto {
    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      name: user.name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      created_at: new Date().toISOString(), // TODO: Agregar created_at a la entidad
      updated_at: new Date().toISOString(), // TODO: Agregar updated_at a la entidad
      is_active: true, // TODO: Agregar is_active a la entidad
      role: user.role,
    };
  }

  private async buildStudentProfile(
    user: User,
    baseInfo: BaseUserInfoDto,
  ): Promise<StudentProfileResponseDto> {
    const studentProfile: StudentProfileDto = {
      student_id: user.student_id || 'N/A',
      career: 'Ingeniería en Sistemas Computacionales', // TODO: Implementar relación con carrera
      semester: 5, // TODO: Implementar campo semester en User o crear tabla Student
      student_code: user.student_id || 'N/A',
      enrollment_date: new Date().toISOString(), // TODO: Implementar fecha de inscripción
      academic_status: 'active',
    };

    const statistics = await this.getStudentStatistics(user.user_id);
    const recentActivity = await this.getStudentRecentActivity(user.user_id);

    return {
      user_info: baseInfo,
      student_profile: studentProfile,
      statistics,
      recent_activity: recentActivity,
    };
  }

  private async buildProfessorProfile(
    user: User,
    baseInfo: BaseUserInfoDto,
  ): Promise<ProfessorProfileResponseDto> {
    const professorProfile: ProfessorProfileDto = {
      employee_id: user.employee_id || 'N/A',
      department: 'Departamento de Sistemas y Computación', // TODO: Implementar relación
      faculty: 'Facultad de Ingeniería', // TODO: Implementar relación
      employee_code: user.employee_id || 'N/A',
      hire_date: new Date().toISOString(), // TODO: Implementar fecha de contratación
      academic_degree: 'Maestro en Ciencias', // TODO: Implementar campo
      specialties: ['Programación', 'Algoritmos'], // TODO: Implementar tabla de especialidades
      office_location: 'Edificio A, Oficina 201', // TODO: Implementar campo
      office_hours: 'Lunes a Viernes 10:00-12:00', // TODO: Implementar horario
    };

    const assignedSubjects = await this.getProfessorSubjects(user.user_id);
    const statistics = await this.getProfessorStatistics(user.user_id);
    const availability = await this.getProfessorAvailability(user.user_id);

    return {
      user_info: baseInfo,
      professor_profile: professorProfile,
      assigned_subjects: assignedSubjects,
      statistics,
      availability,
    };
  }

  private async buildAdminProfile(
    user: User,
    baseInfo: BaseUserInfoDto,
  ): Promise<AdminProfileResponseDto> {
    const adminProfile: AdminProfileDto = {
      employee_id: user.employee_id || 'N/A',
      department: 'Administración Académica',
      position: 'Coordinador de Asesorías',
      access_level: 'full',
      permissions: ['users_management', 'system_config', 'reports'],
      employee_code: user.employee_id || 'N/A',
    };

    const systemInfo = await this.getAdminSystemInfo(user.user_id);

    return {
      user_info: baseInfo,
      admin_profile: adminProfile,
      system_info: systemInfo,
    };
  }

  private async getStudentStatistics(
    userId: number,
  ): Promise<StudentStatisticsDto> {
    try {
      // Query para obtener estadísticas del estudiante
      const totalAppointments = await this.usersRepo
        .createQueryBuilder('user')
        .leftJoin('user.attendances', 'attendance')
        .where('user.user_id = :userId', { userId })
        .getCount();

      const completedSessions = await this.usersRepo
        .createQueryBuilder('user')
        .leftJoin('user.attendances', 'attendance')
        .where('user.user_id = :userId', { userId })
        .andWhere('attendance.attended = :attended', { attended: true })
        .getCount();

      const activeSessions = await this.usersRepo
        .createQueryBuilder('user')
        .leftJoin('user.attendances', 'attendance')
        .leftJoin('attendance.advisory_date', 'date')
        .where('user.user_id = :userId', { userId })
        .andWhere('date.date > :now', { now: new Date() })
        .getCount();

      return {
        total_appointments: totalAppointments,
        completed_sessions: completedSessions,
        active_appointments: activeSessions,
        total_hours_received: completedSessions * 2, // Asumiendo 2 horas por sesión
      };
    } catch (error) {
      console.error('Error getting student statistics:', error);
      return {
        total_appointments: 0,
        completed_sessions: 0,
        active_appointments: 0,
        total_hours_received: 0,
      };
    }
  }

  private getStudentRecentActivity(
    userId: number,
  ): RecentActivityDto {
    try {
      // TODO: Implementar queries reales para actividad reciente
      return {
        last_appointment: null,
        upcoming_appointments: [],
        recently_completed: [],
      };
    } catch (error) {
      console.error('Error getting student recent activity:', error);
      return {
        last_appointment: null,
        upcoming_appointments: [],
        recently_completed: [],
      };
    }
  }

  private async getProfessorSubjects(
    userId: number,
  ): Promise<AssignedSubjectsDto> {
    try {
      // Query para obtener materias del profesor
      const subjects = await this.usersRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.subject_details', 'subject_detail')
        .leftJoinAndSelect('subject_detail.subject', 'subject')
        .where('user.user_id = :userId', { userId })
        .getOne();

      const subjectList =
        subjects?.subject_details?.map((detail) => ({
          subject_id: detail.subject_detail_id,
          name: detail.subject?.subject || 'Sin nombre',
          // TODO: Agregar más campos según la estructura real
        })) || [];

      return {
        subjects: subjectList,
        total_subjects: subjectList.length,
      };
    } catch (error) {
      console.error('Error getting professor subjects:', error);
      return {
        subjects: [],
        total_subjects: 0,
      };
    }
  }

  private async getProfessorStatistics(
    userId: number,
  ): Promise<ProfessorStatisticsDto> {
    try {
      // Query para estadísticas del profesor
      const totalAdvisories = await this.usersRepo
        .createQueryBuilder('user')
        .leftJoin('user.advisories', 'advisory')
        .where('user.user_id = :userId', { userId })
        .getCount();

      const activeAdvisories = await this.usersRepo
        .createQueryBuilder('user')
        .leftJoin('user.advisories', 'advisory')
        .where('user.user_id = :userId', { userId })
        .andWhere('advisory.status = :status', { status: 'active' })
        .getCount();

      // TODO: Implementar queries para estudiantes ayudados y rating promedio

      return {
        total_advisories: totalAdvisories,
        active_advisories: activeAdvisories,
        total_students_helped: 0, // TODO: Implementar
        total_hours_taught: totalAdvisories * 2, // Estimación
        average_rating: 4.5, // TODO: Implementar sistema de calificaciones
      };
    } catch (error) {
      console.error('Error getting professor statistics:', error);
      return {
        total_advisories: 0,
        active_advisories: 0,
        total_students_helped: 0,
        total_hours_taught: 0,
        average_rating: 0,
      };
    }
  }

  private async getProfessorAvailability(
    userId: number,
  ): Promise<AvailabilityDto> {
    try {
      // TODO: Implementar queries para disponibilidad del profesor
      return {
        current_schedule: [],
        next_available_slot: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(),
      };
    } catch (error) {
      console.error('Error getting professor availability:', error);
      return {
        current_schedule: [],
        next_available_slot: new Date().toISOString(),
      };
    }
  }

  private async getAdminSystemInfo(userId: number): Promise<SystemInfoDto> {
    try {
      // TODO: Implementar tracking de login y actividad del admin
      return {
        last_login: new Date().toISOString(),
        total_logins: 100, // TODO: Implementar counter real
        managed_areas: ['Usuarios', 'Asesorías', 'Reportes'],
      };
    } catch (error) {
      console.error('Error getting admin system info:', error);
      return {
        last_login: new Date().toISOString(),
        total_logins: 0,
        managed_areas: [],
      };
    }
  }
}
