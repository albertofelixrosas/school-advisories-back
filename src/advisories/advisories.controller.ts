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
} from '@nestjs/common';
import { RequestWithUser } from '../auth/types/request-with-user';
import { AdvisoriesService } from './advisories.service';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { CreateDirectSessionDto } from './dto/create-direct-session.dto';
import { InviteStudentsDto, RespondInvitationDto } from './dto/invitation.dto';
import { InvitationService } from './services/invitation.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

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
}
