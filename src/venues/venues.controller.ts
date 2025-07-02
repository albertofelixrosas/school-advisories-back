import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';
import { VenueType } from './venue-type.enum';

@ApiTags('Venues')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard) // Asegura que solo usuarios autenticados puedan acceder
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva ubicación' })
  @ApiCreatedResponse({ description: 'Ubicación creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() dto: CreateVenueDto) {
    this.validateVenueDto(dto);
    return this.venuesService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas las ubicaciones' })
  @ApiOkResponse({ description: 'Lista de ubicaciones' })
  findAll() {
    return this.venuesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener una ubicación por ID' })
  @ApiOkResponse({ description: 'Ubicación encontrada' })
  @ApiNotFoundResponse({ description: 'Ubicación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una ubicación por ID' })
  @ApiOkResponse({ description: 'Ubicación actualizada correctamente' })
  @ApiNotFoundResponse({ description: 'Ubicación no encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
    this.validateVenueDto(dto);
    return this.venuesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una ubicación por ID' })
  @ApiOkResponse({ description: 'Ubicación eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Ubicación no encontrada' })
  remove(@Param('id') id: string) {
    return this.venuesService.remove(+id);
  }

  validateVenueDto(dto: CreateVenueDto | UpdateVenueDto) {
    const { type, url, building, floor } = dto;
    if (type === VenueType.VIRTUAL && !url) {
      throw new Error('La URL es obligatoria para ubicaciones virtuales');
    }
    if (
      (type === VenueType.CLASSROOM || type === VenueType.OFFICE) &&
      (!building || !floor)
    ) {
      throw new Error(
        'El edificio y el piso son obligatorios para aulas y oficinas',
      );
    }
    if (type === VenueType.VIRTUAL && (building || floor)) {
      throw new Error(
        'Edificio y piso no deben ser especificados para ubicaciones virtuales',
      );
    }
    if (
      (type === VenueType.CLASSROOM || type === VenueType.OFFICE) &&
      (url || !building || !floor)
    ) {
      throw new Error('La URL no debe ser especificada para aulas y oficinas');
    }
  }
}
