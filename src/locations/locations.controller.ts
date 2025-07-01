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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import {
  ApiBadRequestResponse,
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

@ApiTags('Locations')
@UseGuards(JwtAuthGuard, RolesGuard) // Asegura que solo usuarios autenticados puedan acceder
@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva ubicación' })
  @ApiCreatedResponse({ description: 'Ubicación creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() dto: CreateLocationDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas las ubicaciones' })
  @ApiOkResponse({ description: 'Lista de ubicaciones' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener una ubicación por ID' })
  @ApiOkResponse({ description: 'Ubicación encontrada' })
  @ApiNotFoundResponse({ description: 'Ubicación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una ubicación por ID' })
  @ApiOkResponse({ description: 'Ubicación actualizada correctamente' })
  @ApiNotFoundResponse({ description: 'Ubicación no encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una ubicación por ID' })
  @ApiOkResponse({ description: 'Ubicación eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Ubicación no encontrada' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
