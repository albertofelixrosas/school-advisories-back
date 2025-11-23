import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RequestWithUser } from '../auth/types/request-with-user';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AdminDashboardStatsDto } from './dto/admin-dashboard-stats.dto';
import { ProfessorDashboardStatsDto } from './dto/professor-dashboard-stats.dto';
import { StudentDashboardStatsDto } from './dto/student-dashboard-stats.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user-role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'Usuario creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o ya registrados' })
  create(@Body() body: CreateUserDto) {
    try {
      return this.usersService.create(body);
    } catch (error) {
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al crear el usuario:', error.message);
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          error instanceof Error ? error.message : 'Error al crear el usuario',
        error: 'Bad Request',
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiOkResponse({ description: 'Lista de usuarios' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('students')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los estudiantes' })
  @ApiOkResponse({ description: 'Lista de usuarios con rol estudiante' })
  findAllStudents() {
    return this.usersService.findByRole(UserRole.STUDENT);
  }

  @Get('professors')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los profesores' })
  @ApiOkResponse({ description: 'Lista de usuarios con rol profesor' })
  findAllProfessors() {
    return this.usersService.findByRole(UserRole.PROFESSOR);
  }

  @Get('admin/dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Get comprehensive dashboard statistics (Admin only)',
    description:
      'Returns comprehensive statistics including users, advisories, sessions, requests, attendance, subjects, and top performers',
  })
  @ApiOkResponse({
    description: 'Dashboard statistics retrieved successfully',
    type: AdminDashboardStatsDto,
  })
  async getAdminDashboardStats() {
    return this.usersService.getAdminDashboardStats();
  }

  @Get('professor/dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Get professor dashboard statistics (Professor only)',
    description:
      'Returns professor-specific statistics including active advisories, pending requests, students helped, upcoming sessions, and performance metrics',
  })
  @ApiOkResponse({
    description: 'Professor dashboard statistics retrieved successfully',
    type: ProfessorDashboardStatsDto,
  })
  async getProfessorDashboardStats(@Req() req: RequestWithUser) {
    return this.usersService.getProfessorDashboardStats(req.user.user_id);
  }

  @Get('student/dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Get student dashboard statistics (Student only)',
    description:
      'Returns student-specific statistics including active advisories, completed advisories, pending requests, recent activity, and learning metrics',
  })
  @ApiOkResponse({
    description: 'Student dashboard statistics retrieved successfully',
    type: StudentDashboardStatsDto,
  })
  async getStudentDashboardStats(@Req() req: RequestWithUser) {
    return this.usersService.getStudentDashboardStats(req.user.user_id);
  }

  @Get('students/:studentId/subjects')
  @ApiOperation({
    summary: 'Obtener las materias de un estudiante específico',
    description:
      'Retorna las materias en las que está inscrito un estudiante a través de sus asesorías programadas',
  })
  @ApiOkResponse({
    description: 'Materias del estudiante obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        student: {
          type: 'object',
          properties: {
            user_id: { type: 'number' },
            name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            student_id: { type: 'string' },
          },
        },
        enrolled_subjects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subject_detail_id: { type: 'number' },
              subject: {
                type: 'object',
                properties: {
                  subject_id: { type: 'number' },
                  subject: { type: 'string' },
                },
              },
              professor: {
                type: 'object',
                properties: {
                  user_id: { type: 'number' },
                  name: { type: 'string' },
                  last_name: { type: 'string' },
                  email: { type: 'string' },
                  photo_url: { type: 'string' },
                },
              },
              advisories_count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  findStudentSubjects(@Param('studentId') studentId: string) {
    return this.usersService.findStudentSubjects(+studentId);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar rol del usuario' })
  updateRole(@Param('id') id: number, @Body() dto: UpdateUserRoleDto) {
    try {
      return this.usersService.updateRole(id, dto.role);
    } catch (error) {
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al actualizar el rol del usuario:', error.message);
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          error instanceof Error ? error.message : 'Error al actualizar el rol',
        error: 'Bad Request',
      };
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar información del usuario' })
  @ApiBody({
    type: UpdateUserDto,
    description:
      'Datos del usuario a actualizar (todos los campos son opcionales)',
    examples: {
      'Actualización completa': {
        value: {
          name: 'Juan Carlos',
          last_name: 'Pérez García',
          email: 'juan.carlos.perez@example.com',
          phone_number: '+526441234567',
          username: 'juancarlos2024',
          password: 'nueva_clave_segura456',
          photo_url:
            'https://firebasestorage.googleapis.com/v0/b/project/o/users%2Fjuan.jpg',
          school_id: 3,
          role: 'professor',
        },
      },
      'Actualización parcial - solo nombre y email': {
        value: {
          name: 'María Elena',
          email: 'maria.elena@example.com',
        },
      },
      'Actualización de contraseña': {
        value: {
          password: 'mi_nueva_contraseña_segura',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Usuario actualizado correctamente',
    schema: {
      example: {
        user_id: 1,
        name: 'Juan Carlos',
        last_name: 'Pérez García',
        email: 'juan.carlos.perez@example.com',
        phone_number: '+526441234567',
        username: 'juancarlos2024',
        photo_url:
          'https://firebasestorage.googleapis.com/v0/b/project/o/users%2Fjuan.jpg',
        school_id: 3,
        role: 'professor',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o usuario no encontrado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Usuario no encontrado o datos inválidos',
        error: 'Bad Request',
      },
    },
  })
  async update(@Param('id') id: number, @Body() body: UpdateUserDto) {
    try {
      return await this.usersService.update(id, body);
    } catch (error) {
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al actualizar el usuario:', error.message);

        // Manejar diferentes tipos de errores
        if (error.message.includes('ya está en uso')) {
          return {
            statusCode: HttpStatus.CONFLICT,
            message: error.message,
            error: 'Conflict',
          };
        }

        if (error.message.includes('no encontrado')) {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: error.message,
            error: 'Not Found',
          };
        }

        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
          error: 'Bad Request',
        };
      }

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      };
    }
  }
}
