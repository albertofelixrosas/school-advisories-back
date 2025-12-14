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
  Request,
  Query,
  NotFoundException,
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
import { ProfessorStatsDto } from './dto/professor-stats.dto';
import { PaginatedResponseDto } from '../common/paginated-response.dto';
import { OwnershipGuard } from '../auth/ownership.guard';
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
  @Get('professor/:id/sessions/upcoming')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Obtener sesiones próximas del profesor en los siguientes días',
  })
  @ApiOkResponse({ description: 'Sesiones próximas' })
  async getUpcomingSessions(
    @Param('id', ParseIntPipe) id: number,
    @Query('days') days?: number,
  ) {
    return await this.advisoriesService.getSessionsUpcoming(id, days || 7);
  }

  @Get('professor/:id/sessions/today')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Obtener sesiones de asesoría de hoy del profesor' })
  @ApiOkResponse({ description: 'Sesiones de hoy' })
  async getTodaySessions(@Param('id', ParseIntPipe) id: number) {
    return await this.advisoriesService.getSessionsToday(id);
  }

  @Get('professor/:id/sessions/this-week')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Obtener sesiones de asesoría de esta semana del profesor',
  })
  @ApiOkResponse({ description: 'Sesiones de esta semana' })
  async getWeekSessions(@Param('id', ParseIntPipe) id: number) {
    return await this.advisoriesService.getSessionsThisWeek(id);
  }

  @Get('professor/:id/sessions/this-month')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Obtener sesiones de asesoría de este mes del profesor',
  })
  @ApiOkResponse({ description: 'Sesiones de este mes' })
  async getMonthSessions(@Param('id', ParseIntPipe) id: number) {
    return await this.advisoriesService.getSessionsThisMonth(id);
  }

  @Get('professor/:id/sessions/past')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Obtener sesiones pasadas del profesor' })
  @ApiOkResponse({ description: 'Sesiones pasadas' })
  async getPastSessions(@Param('id', ParseIntPipe) id: number) {
    return await this.advisoriesService.getSessionsPast(id);
  }
  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
  @ApiOperation({
    summary:
      'Buscar y ordenar asesorías/sesiones por texto, materia, profesor, fecha, estudiantes',
  })
  @ApiOkResponse({ description: 'Resultados de búsqueda y ordenamiento', type: PaginatedResponseDto })
  async searchAdvisories(
    @Query()
    query: import('./dto/search-advisories-query.dto').SearchAdvisoriesQueryDto,
  ) {
    return await this.advisoriesService.searchAdvisories(query);
  }
  @Get('professor/:professorId/stats')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({
    summary:
      'Obtener estadísticas agregadas de asesorías y sesiones de un profesor',
  })
  @ApiOkResponse({
    description: 'Estadísticas agregadas',
    type: ProfessorStatsDto,
  })
  async getProfessorStats(
    @Param('professorId', ParseIntPipe) professorId: number,
  ) {
    return await this.advisoriesService.getProfessorStats(professorId);
  }
  @Get('my-sessions')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Obtener sesiones propias del profesor autenticado',
  })
  @ApiOkResponse({ description: 'Lista de sesiones propias' })
  mySessions(@Request() req: RequestWithUser) {
    // El usuario autenticado es profesor, filtrar por su user_id
    return this.advisoriesService.findSessionsByProfessor(req.user.user_id);
  }
  @Get('my-advisories')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Obtener asesorías propias del profesor autenticado',
  })
  @ApiOkResponse({ description: 'Lista de asesorías propias' })
  myAdvisories(@Request() req: RequestWithUser) {
    // El usuario autenticado es profesor, filtrar por su user_id
    return this.advisoriesService.findByProfessor(req.user.user_id);
  }
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
    console.log('Crear asesoría con datos:', dto);
    return this.advisoriesService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener todas las asesorías' })
  @ApiOkResponse({ description: 'Lista de asesorías' })
  findAll() {
    return this.advisoriesService.findAll();
  }

  @Get('professor/:professorId')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @UseGuards(OwnershipGuard)
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
    return await this.advisoriesService.findByProfessor(professorId);
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
    const includePastBool = includePast === 'false' ? false : true;
    return await this.advisoriesService.findByProfessorWithSessions(
      professorId,
      includePastBool,
    );
  }



  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener asesoría por ID' })
  @ApiOkResponse({ description: 'Asesoría encontrada' })
  @ApiNotFoundResponse({ description: 'Asesoría no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.advisoriesService.findOne(id);
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
    return this.advisoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Eliminar asesoría por ID' })
  @ApiOkResponse({ description: 'Asesoría eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Asesoría no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.advisoriesService.remove(id);
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
    const professorId = req.user.user_id; // Obtenido del JWT
    console.log(
      'Crear sesión directa por profesor:',
      professorId,
      'con datos:',
      dto,
    );
    return await this.advisoriesService.createDirectSession(professorId, dto);
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
    const professorId = req.user.user_id;
    return await this.invitationService.inviteStudentsToSession(
      sessionId,
      dto,
      professorId,
    );
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
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Solo profesores necesitan validación de autorización
    const professorId = userRole === UserRole.PROFESSOR ? userId : undefined;

    return await this.invitationService.getSessionInvitations(
      sessionId,
      professorId,
    );
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
  async getSessionStudents(
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return await this.advisoriesService.getSessionStudents(sessionId);
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
