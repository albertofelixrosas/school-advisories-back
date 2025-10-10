import {
  Controller,
  Post,
  Body,
  Get,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from './types/request-with-user';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  StudentProfileResponseDto,
  ProfessorProfileResponseDto,
  AdminProfileResponseDto,
  ProfileErrorDto,
} from './dto/profile-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión y obtener token JWT con datos del dashboard',
    description:
      'Autentica al usuario y retorna tokens JWT junto con información personalizada del dashboard según su rol (profesor, estudiante o admin)',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login exitoso con datos del dashboard incluidos',
    type: LoginResponseDto,
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        username: 'jdoe2024',
        user: {
          user_id: 1,
          username: 'jdoe2024',
          name: 'Juan',
          last_name: 'Doe',
          email: 'juan.doe@university.edu',
          phone_number: '+526441234567',
          role: 'professor',
          photo_url: 'https://example.com/photo.jpg',
          school_id: 1,
          employee_id: 'PR2024001',
        },
        dashboard_data: {
          professor_stats: {
            active_advisories_count: 5,
            total_students_enrolled: 25,
            upcoming_sessions_count: 3,
            completed_sessions_count: 12,
          },
          assigned_subjects: [],
          active_advisories: [],
          upcoming_advisory_dates: [],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    try {
      if (!body.username || !body.password) {
        throw new UnauthorizedException('Credenciales incompletas');
      }

      if (
        typeof body.username !== 'string' ||
        typeof body.password !== 'string'
      ) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const user = await this.authService.validateUser(
        body.username,
        body.password,
      );

      return await this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof Error) {
        console.error('Error al iniciar sesión:', error.message);
      }

      throw new UnauthorizedException('Error al iniciar sesión');
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acceso usando refresh_token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'Nuevo token generado correctamente',
    schema: {
      example: {
        access_token: 'nuevo.jwt.token',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido o faltante' })
  refresh(@Body() body: RefreshTokenDto) {
    if (!body.username || !body.refresh_token) {
      throw new UnauthorizedException('Datos incompletos');
    }
    return this.authService.refreshAccessToken(
      body.username,
      body.refresh_token,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Cerrar sesión y revocar refresh_token',
    description:
      'Este endpoint cierra la sesión del usuario autenticado. Se requiere un token JWT válido en el encabezado Authorization.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Sesión cerrada correctamente',
    schema: {
      example: {
        message: 'Sesión cerrada',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido o faltante',
  })
  logout(@Req() req: RequestWithUser) {
    return this.authService.logout(req.user.user_id);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener perfil del usuario',
    description:
      'Obtiene información completa del perfil del usuario basada en su rol (Estudiante, Profesor o Admin)',
  })
  @ApiOkResponse({
    description: 'Perfil obtenido exitosamente',
    content: {
      'application/json': {
        examples: {
          'student-profile': {
            summary: 'Perfil de Estudiante',
            value: {
              profile: {
                user_info: {
                  id: 1,
                  username: 'student123',
                  email: 'student@example.com',
                  first_name: 'Juan',
                  last_name: 'Pérez',
                  role: 'STUDENT',
                  student_id: 'STU2024001',
                  created_at: '2024-01-15T10:00:00Z',
                  updated_at: '2024-01-15T10:00:00Z',
                },
                academic_info: {
                  current_semester: 5,
                  enrollment_year: 2022,
                  career: 'Ingeniería en Sistemas',
                  advisor_id: 2,
                  advisor_name: 'Dr. García',
                },
                statistics: {
                  total_advisories: 25,
                  completed_advisories: 20,
                  pending_advisories: 5,
                  subjects_count: 8,
                  average_attendance: 85.5,
                },
              },
            },
          },
          'professor-profile': {
            summary: 'Perfil de Profesor',
            value: {
              profile: {
                user_info: {
                  id: 2,
                  username: 'prof.garcia',
                  email: 'garcia@university.edu',
                  first_name: 'María',
                  last_name: 'García',
                  role: 'PROFESSOR',
                  employee_id: 'EMP2024002',
                  created_at: '2024-01-10T09:00:00Z',
                  updated_at: '2024-01-10T09:00:00Z',
                },
                academic_info: {
                  department: 'Computer Science',
                  position: 'Associate Professor',
                  hire_date: '2020-08-15',
                  office_location: 'Building A, Room 201',
                },
                statistics: {
                  total_students: 45,
                  active_advisories: 12,
                  subjects_teaching: 3,
                  total_advisories_given: 150,
                  average_student_satisfaction: 4.6,
                },
              },
            },
          },
          'admin-profile': {
            summary: 'Perfil de Administrador',
            value: {
              profile: {
                user_info: {
                  id: 3,
                  username: 'admin.director',
                  email: 'director@university.edu',
                  first_name: 'Carlos',
                  last_name: 'Rodríguez',
                  role: 'ADMIN',
                  employee_id: 'ADM2024001',
                  created_at: '2024-01-01T08:00:00Z',
                  updated_at: '2024-01-01T08:00:00Z',
                },
                administrative_info: {
                  department: 'Academic Affairs',
                  position: 'Academic Director',
                  permissions: [
                    'manage_users',
                    'view_reports',
                    'system_config',
                  ],
                },
                statistics: {
                  total_users: 500,
                  total_students: 300,
                  total_professors: 50,
                  total_advisories: 2500,
                  system_uptime: '99.8%',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Acceso denegado - Token inválido o faltante',
    type: ProfileErrorDto,
  })
  async getProfile(@Req() req: RequestWithUser) {
    return this.profileService.getUserProfile(req.user.user_id);
  }
}
