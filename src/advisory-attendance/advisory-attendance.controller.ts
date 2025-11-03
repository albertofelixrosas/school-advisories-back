import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AdvisoryAttendanceService } from './advisory-attendance.service';
import { CreateAdvisoryAttendanceDto } from './dto/create-advisory-attendance.dto';
import { UpdateAdvisoryAttendanceDto } from './dto/update-advisory-attendance.dto';
import {
  BulkAttendanceDto,
  CompleteSessionDto,
} from './dto/bulk-attendance.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

@ApiTags('Advisory Attendance')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('advisory-attendance')
export class AdvisoryAttendanceController {
  constructor(
    private readonly advisoryAttendanceService: AdvisoryAttendanceService,
  ) {}

  @Post()
  create(@Body() createAdvisoryAttendanceDto: CreateAdvisoryAttendanceDto) {
    return this.advisoryAttendanceService.create(createAdvisoryAttendanceDto);
  }

  @Get()
  findAll() {
    return this.advisoryAttendanceService.findAll();
  }

  @Get('advisory/:advisory_date_id')
  findByAdvisory(@Param('advisory_date_id') advisory_date_id: number) {
    return this.advisoryAttendanceService.findByAdvisory(advisory_date_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advisoryAttendanceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdvisoryAttendanceDto: UpdateAdvisoryAttendanceDto,
  ) {
    return this.advisoryAttendanceService.update(
      +id,
      updateAdvisoryAttendanceDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advisoryAttendanceService.remove(+id);
  }

  @Post('session/:sessionId/bulk-attendance')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Marcar asistencia masiva',
    description:
      'Permite al profesor marcar la asistencia de múltiples estudiantes a la vez',
  })
  @ApiCreatedResponse({ description: 'Asistencias marcadas exitosamente' })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o estudiantes no encontrados',
  })
  @ApiNotFoundResponse({ description: 'Sesión no encontrada' })
  async markBulkAttendance(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: BulkAttendanceDto,
    @Request() req: any,
  ) {
    try {
      const professorId = req.user.userId;
      return await this.advisoryAttendanceService.markBulkAttendance(
        sessionId,
        dto,
        professorId,
      );
    } catch (error) {
      console.error('Error al marcar asistencia masiva:', error);
      throw error;
    }
  }

  @Patch('session/:sessionId/complete')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Completar sesión de asesoría',
    description: 'Marca una sesión como completada con notas finales',
  })
  @ApiOkResponse({ description: 'Sesión completada exitosamente' })
  @ApiBadRequestResponse({
    description: 'Sesión ya completada o datos inválidos',
  })
  @ApiNotFoundResponse({ description: 'Sesión no encontrada' })
  async completeSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: CompleteSessionDto,
    @Request() req: any,
  ) {
    try {
      const professorId = req.user.userId;
      return await this.advisoryAttendanceService.completeSession(
        sessionId,
        dto,
        professorId,
      );
    } catch (error) {
      console.error('Error al completar sesión:', error);
      throw error;
    }
  }

  @Get('session/:sessionId/report')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Obtener reporte de asistencia',
    description: 'Obtiene estadísticas y detalles de asistencia de una sesión',
  })
  @ApiOkResponse({
    description: 'Reporte de asistencia obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        session: { type: 'object' },
        total_registered: { type: 'number' },
        total_attended: { type: 'number' },
        attendance_rate: { type: 'number' },
        attendances: { type: 'array' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Sesión no encontrada' })
  async getSessionReport(@Param('sessionId', ParseIntPipe) sessionId: number) {
    try {
      return await this.advisoryAttendanceService.getSessionAttendanceReport(
        sessionId,
      );
    } catch (error) {
      console.error('Error al obtener reporte:', error);
      throw error;
    }
  }
}
