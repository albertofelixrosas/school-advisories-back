import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdvisoryRequestService } from './advisory-request.service';
import { CreateAdvisoryRequestDto } from './dto/create-advisory-request.dto';
import { ApproveRequestDto, RejectRequestDto } from './dto/process-request.dto';
import { AdvisoryRequestResponseDto } from './dto/advisory-request-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { RequestWithUser } from '../auth/types/request-with-user';

@ApiTags('Advisory Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('advisory-requests')
export class AdvisoryRequestController {
  constructor(
    private readonly advisoryRequestService: AdvisoryRequestService,
  ) {}

  @Post()
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Crear nueva solicitud de asesoría',
    description:
      'Permite a un estudiante crear una nueva solicitud de asesoría para una materia específica',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud creada exitosamente',
    type: AdvisoryRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe una solicitud pendiente para esta materia',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo los estudiantes pueden crear solicitudes',
  })
  @ApiResponse({
    status: 404,
    description: 'La materia especificada no existe',
  })
  async createRequest(
    @Body() createDto: CreateAdvisoryRequestDto,
    @Request() req: RequestWithUser,
  ): Promise<AdvisoryRequestResponseDto> {
    return this.advisoryRequestService.createRequest(
      req.user.user_id,
      createDto,
    );
  }

  @Get('my-requests')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Obtener mis solicitudes',
    description:
      'Permite a un estudiante ver todas sus solicitudes de asesoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes del estudiante',
    type: [AdvisoryRequestResponseDto],
  })
  async getMyRequests(
    @Request() req: RequestWithUser,
  ): Promise<AdvisoryRequestResponseDto[]> {
    return this.advisoryRequestService.findMyRequests(req.user.user_id);
  }

  @Get('pending')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Obtener solicitudes pendientes',
    description:
      'Permite a un profesor ver todas las solicitudes pendientes dirigidas a él',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes pendientes para el profesor',
    type: [AdvisoryRequestResponseDto],
  })
  async getPendingRequests(
    @Request() req: RequestWithUser,
  ): Promise<AdvisoryRequestResponseDto[]> {
    return this.advisoryRequestService.findPendingByProfessor(req.user.user_id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Aprobar solicitud de asesoría',
    description: 'Permite a un profesor aprobar una solicitud pendiente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la solicitud',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud aprobada exitosamente',
    type: AdvisoryRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden aprobar solicitudes pendientes',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para procesar esta solicitud',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async approveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() approvalDto: ApproveRequestDto,
    @Request() req: RequestWithUser,
  ): Promise<AdvisoryRequestResponseDto> {
    return this.advisoryRequestService.approveRequest(
      id,
      req.user.user_id,
      approvalDto,
    );
  }

  @Patch(':id/reject')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Rechazar solicitud de asesoría',
    description: 'Permite a un profesor rechazar una solicitud pendiente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la solicitud',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud rechazada exitosamente',
    type: AdvisoryRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden rechazar solicitudes pendientes',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para procesar esta solicitud',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectionDto: RejectRequestDto,
    @Request() req: RequestWithUser,
  ): Promise<AdvisoryRequestResponseDto> {
    return this.advisoryRequestService.rejectRequest(
      id,
      req.user.user_id,
      rejectionDto,
    );
  }

  @Delete(':id/cancel')
  @Roles(UserRole.STUDENT, UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Cancelar solicitud de asesoría',
    description: 'Permite cancelar una solicitud (estudiante o profesor)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la solicitud',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud cancelada exitosamente',
    type: AdvisoryRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar una solicitud en este estado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para cancelar esta solicitud',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async cancelRequest(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<AdvisoryRequestResponseDto> {
    return this.advisoryRequestService.cancelRequest(id, req.user.user_id);
  }

  @Get('available-schedules/:subjectDetailId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Obtener horarios disponibles para una materia',
    description:
      'Consulta los horarios disponibles de un profesor para una materia específica',
  })
  @ApiParam({
    name: 'subjectDetailId',
    description: 'ID del detalle de materia',
    type: 'number',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: 'string',
    description: 'Fecha inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: 'string',
    description: 'Fecha fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Horarios disponibles obtenidos exitosamente',
  })
  async getAvailableSchedules(
    @Param('subjectDetailId', ParseIntPipe) subjectDetailId: number,
    @Query('dateFrom') dateFromString?: string,
    @Query('dateTo') dateToString?: string,
  ) {
    const dateFrom = dateFromString ? new Date(dateFromString) : undefined;
    const dateTo = dateToString ? new Date(dateToString) : undefined;

    return this.advisoryRequestService.getAvailableSchedulesForSubject(
      subjectDetailId,
      dateFrom,
      dateTo,
    );
  }
}
