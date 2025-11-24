import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AdvisoryDatesService } from './advisory-dates.service';
import { CreateAdvisoryDateDto } from './dto/create-advisory-date.dto';
import { UpdateAdvisoryDateDto } from './dto/update-advisory-date.dto';
import { FindAdvisoryDatesQueryDto } from './dto/find-advisory-dates-query.dto';
import { PaginatedResponseDto } from '../common/paginated-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Advisory Dates')
@Controller('advisory-dates')
export class AdvisoryDatesController {
  constructor(private readonly advisoryDatesService: AdvisoryDatesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sesión de asesoría' })
  create(@Body() createAdvisoryDateDto: CreateAdvisoryDateDto) {
    return this.advisoryDatesService.create(createAdvisoryDateDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener sesiones de asesoría con filtros y paginación',
    description:
      'Obtiene todas las sesiones de asesoría con opciones de filtrado por asesoría, profesor, rango de fechas, estado y paginación',
  })
  @ApiOkResponse({
    description: 'Sesiones obtenidas exitosamente con metadatos de paginación',
    type: PaginatedResponseDto,
  })
  @ApiQuery({ name: 'advisory_id', required: false, type: Number })
  @ApiQuery({ name: 'professor_id', required: false, type: Number })
  @ApiQuery({ name: 'from_date', required: false, type: String })
  @ApiQuery({ name: 'to_date', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['upcoming', 'completed', 'all'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: FindAdvisoryDatesQueryDto,
  ) {
    return this.advisoryDatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sesión específica por ID' })
  findOne(@Param('id') id: string) {
    return this.advisoryDatesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una sesión de asesoría' })
  update(
    @Param('id') id: string,
    @Body() updateAdvisoryDateDto: UpdateAdvisoryDateDto,
  ) {
    return this.advisoryDatesService.update(+id, updateAdvisoryDateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sesión de asesoría' })
  remove(@Param('id') id: string) {
    return this.advisoryDatesService.remove(+id);
  }
}
