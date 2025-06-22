import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AdvisoriesService } from './advisories.service';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Advisories')
@Controller('advisories')
export class AdvisoriesController {
  constructor(private readonly service: AdvisoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva asesoría' })
  @ApiCreatedResponse({ description: 'Asesoría creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() dto: CreateAdvisoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las asesorías' })
  @ApiOkResponse({ description: 'Lista de asesorías' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asesoría por ID' })
  @ApiOkResponse({ description: 'Asesoría encontrada' })
  @ApiNotFoundResponse({ description: 'Asesoría no encontrada' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una asesoría por ID' })
  @ApiOkResponse({ description: 'Asesoría actualizada correctamente' })
  @ApiNotFoundResponse({ description: 'Asesoría no encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateAdvisoryDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asesoría por ID' })
  @ApiOkResponse({ description: 'Asesoría eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Asesoría no encontrada' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
