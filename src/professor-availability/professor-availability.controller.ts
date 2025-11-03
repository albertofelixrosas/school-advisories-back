import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProfessorAvailabilityService } from './professor-availability.service';
import { CreateAvailabilitySlotDto } from './dto/create-availability.dto';
import { UpdateAvailabilitySlotDto } from './dto/update-availability.dto';
import {
  GetAvailabilityQueryDto,
  AvailabilitySlotResponseDto,
  BulkAvailabilityDto,
} from './dto/availability-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';

@ApiTags('Professor Availability')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('professor-availability')
export class ProfessorAvailabilityController {
  constructor(
    private readonly availabilityService: ProfessorAvailabilityService,
  ) {}

  @Post('slots')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Crear nuevo slot de disponibilidad',
    description:
      'Permite a un profesor crear un nuevo horario de disponibilidad',
  })
  @ApiResponse({
    status: 201,
    description: 'Slot de disponibilidad creado exitosamente',
    type: AvailabilitySlotResponseDto,
  })
  async createSlot(
    @Body() dto: CreateAvailabilitySlotDto,
    @Request() req: any,
  ): Promise<AvailabilitySlotResponseDto> {
    // Asegurar que solo pueda crear disponibilidad para sí mismo
    dto.professor_id = req.user.userId;
    return await this.availabilityService.createAvailabilitySlot(dto);
  }

  @Post('bulk-slots')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Crear múltiples slots de disponibilidad',
    description: 'Permite crear varios horarios de disponibilidad de una vez',
  })
  @ApiResponse({
    status: 201,
    description: 'Slots de disponibilidad creados exitosamente',
    type: [AvailabilitySlotResponseDto],
  })
  async createBulkSlots(
    @Body() dto: BulkAvailabilityDto,
    @Request() req: any,
  ): Promise<AvailabilitySlotResponseDto[]> {
    dto.professor_id = req.user.userId;
    return await this.availabilityService.createBulkAvailability(dto);
  }

  @Get('slots')
  @ApiOperation({
    summary: 'Obtener disponibilidad de profesor',
    description: 'Consulta los horarios de disponibilidad de un profesor',
  })
  @ApiQuery({ name: 'professor_id', type: 'number' })
  @ApiQuery({ name: 'subject_detail_id', required: false, type: 'number' })
  @ApiQuery({ name: 'day_of_week', required: false })
  @ApiQuery({ name: 'date', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad obtenida exitosamente',
    type: [AvailabilitySlotResponseDto],
  })
  async getAvailability(
    @Query() query: GetAvailabilityQueryDto,
  ): Promise<AvailabilitySlotResponseDto[]> {
    return await this.availabilityService.getAvailability(query);
  }

  @Get('available-slots/:professorId/:subjectDetailId')
  @ApiOperation({
    summary: 'Obtener slots disponibles para una fecha',
    description:
      'Consulta slots específicos disponibles para reserva en una fecha determinada',
  })
  @ApiQuery({ name: 'date', type: 'string', example: '2024-01-15' })
  async getAvailableSlots(
    @Param('professorId', ParseIntPipe) professorId: number,
    @Param('subjectDetailId', ParseIntPipe) subjectDetailId: number,
    @Query('date') dateString: string,
  ) {
    const targetDate = new Date(dateString);
    return await this.availabilityService.getAvailableSlots(
      professorId,
      subjectDetailId,
      targetDate,
    );
  }

  @Get('my-availability')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Obtener mi disponibilidad',
    description: 'Consulta la disponibilidad del profesor autenticado',
  })
  @ApiQuery({ name: 'subject_detail_id', required: false, type: 'number' })
  @ApiQuery({ name: 'day_of_week', required: false })
  @ApiQuery({ name: 'date', required: false, type: 'string' })
  async getMyAvailability(
    @Query() query: Omit<GetAvailabilityQueryDto, 'professor_id'>,
    @Request() req: any,
  ): Promise<AvailabilitySlotResponseDto[]> {
    const fullQuery: GetAvailabilityQueryDto = {
      ...query,
      professor_id: req.user.userId,
    };
    return await this.availabilityService.getAvailability(fullQuery);
  }

  @Put('slots/:id')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Actualizar slot de disponibilidad',
    description: 'Permite actualizar un horario de disponibilidad existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Slot actualizado exitosamente',
    type: AvailabilitySlotResponseDto,
  })
  async updateSlot(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvailabilitySlotDto,
    @Request() req: any,
  ): Promise<AvailabilitySlotResponseDto> {
    // Asegurar que solo pueda actualizar su propia disponibilidad
    dto.professor_id = req.user.userId;
    return await this.availabilityService.updateAvailabilitySlot(id, dto);
  }

  @Delete('slots/:id/deactivate')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Desactivar slot de disponibilidad',
    description: 'Desactiva un horario sin eliminarlo (mantiene historial)',
  })
  @ApiResponse({
    status: 200,
    description: 'Slot desactivado exitosamente',
  })
  async deactivateSlot(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.availabilityService.deactivateAvailabilitySlot(id);
  }

  @Delete('slots/:id')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({
    summary: 'Eliminar slot de disponibilidad',
    description:
      'Elimina completamente un horario (solo si no hay reservas futuras)',
  })
  @ApiResponse({
    status: 200,
    description: 'Slot eliminado exitosamente',
  })
  async deleteSlot(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.availabilityService.deleteAvailabilitySlot(id);
  }
}
