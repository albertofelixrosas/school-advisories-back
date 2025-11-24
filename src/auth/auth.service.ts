import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserPayload } from './interfaces/user-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';
import {
  LoginResponseDto,
  UserInfoDto,
  DashboardDataDto,
  StudentStatsDto,
  // AdminStatsDto,
  SubjectDetailDto,
  AdvisoryDto,
  AdvisoryDateDto,
  AvailableAdvisoryDto,
  StudentAppointmentDto,
} from './dto/login-response.dto';
import { AuthProfessorStatsDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async validateUser(email: string, pass: string) {
    console.log('🔍 [AUTH] Iniciando validación de usuario:', email);

    const user = await this.usersService.findByEmail(email);
    console.log('👤 [AUTH] Usuario encontrado:', user ? 'SÍ' : 'NO');

    if (user) {
      console.log('🔐 [AUTH] Comparando contraseñas...');
      const passwordMatch = await bcrypt.compare(pass, user.password);
      console.log('✅ [AUTH] Contraseña válida:', passwordMatch ? 'SÍ' : 'NO');

      if (passwordMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        console.log('✅ [AUTH] Validación exitosa para usuario:', email);
        return result;
      }
    }

    console.log('❌ [AUTH] Validación fallida para usuario:', email);
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: UserPayload): Promise<LoginResponseDto> {
    // Obtener usuario completo con todas las relaciones
    const fullUser = await this.usersRepo.findOne({
      where: { user_id: user.user_id },
    });

    if (!fullUser) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const payload = {
      username: user.username,
      sub: user.user_id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '60m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Limpiar tokens anteriores y guardar nuevo
    await this.refreshTokenRepo.delete({ user: { user_id: user.user_id } });

    const tokenEntity = this.refreshTokenRepo.create({
      token: refresh_token,
      user: { user_id: user.user_id },
      expires_at: expiresAt,
    });

    await this.refreshTokenRepo.save(tokenEntity);

    // Preparar información del usuario
    const userInfo: UserInfoDto = {
      user_id: fullUser.user_id,
      username: fullUser.username,
      name: fullUser.name,
      last_name: fullUser.last_name,
      email: fullUser.email,
      phone_number: fullUser.phone_number,
      role: fullUser.role,
      photo_url: fullUser.photo_url,
      school_id: fullUser.school_id,
      student_id: fullUser.student_id,
      employee_id: fullUser.employee_id,
    };

    // Obtener datos del dashboard según el rol
    const dashboard_data = await this.getDashboardData(fullUser);

    return {
      access_token,
      refresh_token,
      username: fullUser.username,
      user: userInfo,
      dashboard_data,
    };
  }

  async refreshAccessToken(username: string, refresh_token: string) {
    try {
      // TODO: Aquí hay que consultar, podría dar error esta linea, (verify<{ sub: number }> no tenia antes el generico)
      const decoded = this.jwtService.verify<{ sub: number }>(refresh_token);
      const user = await this.usersService.findByUsername(username);
      if (!user || user.user_id !== decoded.sub)
        throw new UnauthorizedException();

      const storedToken = await this.refreshTokenRepo.findOne({
        where: {
          token: refresh_token,
          user: { user_id: user.user_id },
        },
      });

      if (!storedToken || storedToken.expires_at < new Date()) {
        throw new UnauthorizedException('Token expirado o inválido');
      }

      const newAccessToken = this.jwtService.sign(
        { username: user.username, sub: user.user_id },
        { expiresIn: '45m' },
      );

      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(userId: number) {
    await this.refreshTokenRepo.delete({ user: { user_id: userId } });
  }

  private async getDashboardData(user: User): Promise<DashboardDataDto> {
    switch (user.role) {
      case UserRole.PROFESSOR:
        return await this.getProfessorDashboardData(user.user_id);

      case UserRole.STUDENT:
        return await this.getStudentDashboardData(user.user_id);

      case UserRole.ADMIN:
        return await this.getAdminDashboardData();

      default:
        return {};
    }
  }

  private async getProfessorDashboardData(
    userId: number,
  ): Promise<DashboardDataDto> {
    try {
      // Obtener estadísticas básicas del profesor
      const stats = await this.getProfessorStats(userId);

      // Obtener materias asignadas
      const assignedSubjects = await this.getProfessorSubjects(userId);

      // Obtener asesorías activas
      const activeAdvisories = await this.getProfessorActiveAdvisories(userId);

      // Obtener próximas fechas de asesorías
      const upcomingDates = await this.getProfessorUpcomingDates(userId);

      return {
        professor_stats: stats,
        assigned_subjects: assignedSubjects,
        active_advisories: activeAdvisories,
        upcoming_advisory_dates: upcomingDates,
      };
    } catch (error) {
      console.error('Error getting professor dashboard data:', error);
      return {
        professor_stats: {
          active_advisories_count: 0,
          total_students_enrolled: 0,
          upcoming_sessions_count: 0,
          completed_sessions_count: 0,
        },
      };
    }
  }

  private async getStudentDashboardData(
    userId: number,
  ): Promise<DashboardDataDto> {
    try {
      const stats = await this.getStudentStats(userId);
      const availableAdvisories = await this.getAvailableAdvisories();
      const myAppointments = await this.getStudentAppointments(userId);

      return {
        student_stats: stats,
        available_advisories: availableAdvisories,
        my_appointments: myAppointments,
      };
    } catch (error) {
      console.error('Error getting student dashboard data:', error);
      return {
        student_stats: {
          active_appointments_count: 0,
          completed_sessions_count: 0,
          available_advisories_count: 0,
        },
      };
    }
  }

  private async getAdminDashboardData(): Promise<DashboardDataDto> {
    try {
      const totalProfessors = await this.usersRepo.count({
        where: { role: UserRole.PROFESSOR },
      });

      const totalStudents = await this.usersRepo.count({
        where: { role: UserRole.STUDENT },
      });

      return {
        admin_stats: {
          total_professors: totalProfessors,
          total_students: totalStudents,
          total_advisories: 0, // TODO: Implementar cuando tengamos la query real
          total_sessions_this_month: 0, // TODO: Implementar
          active_venues: 0, // TODO: Implementar
        },
      };
    } catch (error) {
      console.error('Error getting admin dashboard data:', error);
      return {
        admin_stats: {
          total_professors: 0,
          total_students: 0,
          total_advisories: 0,
          total_sessions_this_month: 0,
          active_venues: 0,
        },
      };
    }
  }

  // Métodos auxiliares para obtener datos específicos
  private getProfessorStats(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number,
  ): Promise<AuthProfessorStatsDto> {
    // Por ahora retornamos datos simulados, se implementarán las queries reales
    return Promise.resolve({
      active_advisories_count: 0,
      total_students_enrolled: 0,
      upcoming_sessions_count: 0,
      completed_sessions_count: 0,
    });
  }

  private getProfessorSubjects(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number,
  ): Promise<SubjectDetailDto[]> {
    // TODO: Implementar query real cuando tengamos las relaciones correctas
    return Promise.resolve([]);
  }

  private getProfessorActiveAdvisories(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number,
  ): Promise<AdvisoryDto[]> {
    // TODO: Implementar query real
    return Promise.resolve([]);
  }

  private getProfessorUpcomingDates(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number,
  ): Promise<AdvisoryDateDto[]> {
    // TODO: Implementar query real
    return Promise.resolve([]);
  }

  private getStudentStats(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number,
  ): Promise<StudentStatsDto> {
    return Promise.resolve({
      active_appointments_count: 0,
      completed_sessions_count: 0,
      available_advisories_count: 0,
    });
  }

  private getAvailableAdvisories(): Promise<AvailableAdvisoryDto[]> {
    return Promise.resolve([]);
  }

  private getStudentAppointments(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number,
  ): Promise<StudentAppointmentDto[]> {
    return Promise.resolve([]);
  }
}
