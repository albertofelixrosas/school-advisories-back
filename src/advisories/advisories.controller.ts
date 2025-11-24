import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  Request,
  Query,
} from '@nestjs/common';
import { RequestWithUser } from '../auth/types/request-with-user';
import { AdvisoriesService } from './advisories.service';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { CreateDirectSessionDto } from './dto/create-direct-session.dto';
import { InviteStudentsDto } from './dto/invitation.dto';
import { SessionStudentsResponseDto } from './dto/session-students.dto';
import { FullSessionDetailsDto } from './dto/full-session-details.dto';
import { AdvisoryWithSessionsDto } from './dto/advisory-with-sessions.dto';
import { InvitationService } from './services/invitation.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';

@ApiTags('Advisories')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('advisories')
export class AdvisoriesController {
  constructor(
    private readonly advisoriesService: AdvisoriesService,
    private readonly invitationService: InvitationService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Crear una nueva asesoría' })
  @ApiCreatedResponse({ description: 'Asesoría creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() dto: CreateAdvisoryDto) {
    try {
      console.log('Crear asesoría con datos:', dto);
      return this.advisoriesService.create(dto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        };
      }
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al crear la asesoría:', error.message);
      }
      return {
        statusCode: 400,
        message:
          error instanceof Error ? error.message : 'Error al crear la asesoría',
        error: 'Bad Request',
      };
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener todas las asesorías' })
  @ApiOkResponse({ description: 'Lista de asesorías' })
  findAll() {
    return this.advisoriesService.findAll();
  }

  @Get('professor/:professorId')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Obtener todas las asesorías de un profesor específico',
    description:
      'Obtiene todas las asesorías asignadas a un profesor, incluyendo información del profesor, detalles de materia y horarios',
  })
  @ApiOkResponse({
    description: 'Asesorías del profesor obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          advisory_id: { type: 'number' },
          max_students: { type: 'number' },
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
          subject_detail: {
            type: 'object',
            properties: {
              subject_detail_id: { type: 'number' },
              subject_name: { type: 'string' },
              schedules: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    day: { type: 'string' },
                    start_time: { type: 'string' },
                    end_time: { type: 'string' },
                  },
                },
              },
            },
          },
          schedules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                advisory_schedule_id: { type: 'number' },
                day: { type: 'string' },
                begin_time: { type: 'string' },
                end_time: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Profesor no encontrado' })
  async findByProfessor(
    @Param('professorId', ParseIntPipe) professorId: number,
  ) {
    try {
      return await this.advisoriesService.findByProfessor(professorId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        };
      }
      // Log other unexpected errors
      if (error instanceof Error) {
        console.error(
          'Error al obtener asesorías del profesor:',
          error.message,
        );
      }
      return {
        statusCode: 500,
        message: 'Error interno del servidor al obtener las asesorías',
        error: 'Internal Server Error',
      };
    }
  }

  @Get('professor/:professorId/with-sessions')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Obtener asesorías de un profesor con sus sesiones incluidas',
    description:
      'Obtiene todas las asesorías de un profesor incluyendo las sesiones (advisory_dates) con información de venue y asistencias. Este endpoint optimiza el número de llamadas HTTP al incluir toda la información en una sola respuesta.',
  })
  @ApiQuery({
    name: 'include_past',
    required: false,
    type: Boolean,
    description:
      'Si es true, incluye sesiones pasadas. Si es false, solo sesiones futuras. Por defecto es true.',
  })
  @ApiOkResponse({
    description: 'Asesorías con sesiones obtenidas exitosamente',
    type: [AdvisoryWithSessionsDto],
  })
  @ApiNotFoundResponse({ description: 'Profesor no encontrado' })
  async findByProfessorWithSessions(
    @Param('professorId', ParseIntPipe) professorId: number,
    @Query('include_past') includePast?: string,
  ) {
    try {
      const includePastBool = includePast === 'false' ? false : true;
      return await this.advisoriesService.findByProfessorWithSessions(
        professorId,
        includePastBool,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        };
      }
      if (error instanceof Error) {
        console.error(
          'Error al obtener asesorías con sesiones del profesor:',
          error.message,
        );
      }
      return {
        statusCode: 500,
        message:
          'Error interno del servidor al obtener las asesorías con sesiones',
        error: 'Internal Server Error',
      };
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener asesoría por ID' })
  @ApiOkResponse({ description: 'Asesoría encontrada' })
  @ApiNotFoundResponse({ description: 'Asesoría no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.advisoriesService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        };
      }
      // Log other unexpected errors
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al obtener la asesoría:', error.message);
      }
      return {
        statusCode: 500,
        message: 'Error interno del servidor al obtener la asesoría',
        error: 'Internal Server Error',
      };
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Actualizar asesoría por ID' })
  @ApiOkResponse({ description: 'Asesoría actualizada exitosamente' })
  @ApiNotFoundResponse({ description: 'Asesoría no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdvisoryDto,
  ) {
    try {
      return this.advisoriesService.update(id, dto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        };
      }
      // Log other unexpected errors
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al actualizar la asesoría:', error.message);
      }
      return {
        statusCode: 500,
        message: 'Error interno del servidor al actualizar la asesoría',
        error: 'Internal Server Error',
      };
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Eliminar asesoría por ID' })
  @ApiOkResponse({ description: 'Asesoría eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Asesoría no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.advisoriesService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        };
      }
      // Log other unexpected errors
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al eliminar la asesoría:', error.message);
      }
      return {
        statusCode: 500,
        message: 'Error interno del servidor al eliminar la asesoría',
        error: 'Internal Server Error',
      };
    }
  }

  @Post('direct-session')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Crear sesión directa de asesoría',
    description:
      'Permite a un profesor crear una sesión de asesoría directamente sin solicitud previa',
  })
  @ApiCreatedResponse({
    description: 'Sesión de asesoría creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        advisory: { type: 'object' },
        advisory_date: { type: 'object' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o conflicto de horario',
  })
  @ApiNotFoundResponse({
    description: 'Materia, venue o profesor no encontrado',
  })
  async createDirectSession(
    @Request() req: RequestWithUser,
    @Body() dto: CreateDirectSessionDto,
  ) {
    try {
      const professorId = req.user.user_id; // Obtenido del JWT
      console.log(
        'Crear sesión directa por profesor:',
        professorId,
        'con datos:',
        dto,
      );

      return await this.advisoriesService.createDirectSession(professorId, dto);
    } catch (error) {
      console.error('Error al crear sesión directa:', error);

      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        };
      }

      return {
        statusCode: 400,
        message:
          error instanceof Error ? error.message : 'Error al crear la sesión',
        error: 'Bad Request',
      };
    }
  }

  @Post('sessions/:sessionId/invite')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Invitar estudiantes a sesión',
    description:
      'Permite al profesor invitar estudiantes específicos a su sesión de asesoría',
  })
  @ApiCreatedResponse({ description: 'Invitaciones enviadas exitosamente' })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o estudiantes no encontrados',
  })
  @ApiNotFoundResponse({ description: 'Sesión no encontrada' })
  async inviteStudentsToSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: InviteStudentsDto,
    @Request() req: RequestWithUser,
  ) {
    try {
      const professorId = req.user.user_id;
      return await this.invitationService.inviteStudentsToSession(
        sessionId,
        dto,
        professorId,
      );
    } catch (error) {
      console.error('Error al invitar estudiantes:', error);
      throw error;
    }
  }

  @Get('sessions/:sessionId/invitations')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Ver invitaciones de sesión',
    description: 'Obtiene todas las invitaciones de una sesión específica',
  })
  @ApiOkResponse({ description: 'Invitaciones obtenidas exitosamente' })
  async getSessionInvitations(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req: RequestWithUser,
  ) {
    try {
      const userId = req.user.user_id;
      const userRole = req.user.role;

      // Solo profesores necesitan validación de autorización
      const professorId = userRole === UserRole.PROFESSOR ? userId : undefined;

      return await this.invitationService.getSessionInvitations(
        sessionId,
        professorId,
      );
    } catch (error) {
      console.error('Error al obtener invitaciones:', error);
      throw error;
    }
  }

  @Get('sessions/:sessionId/students')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all students registered for a session',
    description:
      'Retrieves all students who are registered for a specific advisory session, including their attendance status',
  })
  @ApiOkResponse({
    description: 'Students list retrieved successfully',
    type: SessionStudentsResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async getSessionStudents(@Param('sessionId', ParseIntPipe) sessionId: number) {
    try {
      return await this.advisoriesService.getSessionStudents(sessionId);
    } catch (error) {
      console.error('Error al obtener estudiantes de la sesión:', error);
      throw error;
    }
  }

  @Get('sessions/:sessionId')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get full session details',
    description:
      'Retrieves comprehensive information about a session including venue, subject, professor, schedules, and attendance',
  })
  @ApiOkResponse({
    description: 'Session details retrieved successfully',
    type: FullSessionDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async getFullSessionDetails(
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    try {
      return await this.advisoriesService.getFullSessionDetails(sessionId);
    } catch (error) {
      console.error('Error al obtener detalles de la sesión:', error);
      throw error;
    }
  }
}
