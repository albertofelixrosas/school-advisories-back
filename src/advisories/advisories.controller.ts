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
} from '@nestjs/common';
import { AdvisoriesService } from './advisories.service';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

@ApiTags('Advisories')
@UseGuards(JwtAuthGuard, RolesGuard) // Asegura que solo usuarios autenticados puedan acceder
@Controller('advisories')
export class AdvisoriesController {
  constructor(private readonly advisoriesService: AdvisoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiResponse({ status: 201, description: 'Asesoría creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o incompletos' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() createAdvisoryDto: CreateAdvisoryDto) {
    return this.advisoriesService.create(createAdvisoryDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiResponse({ status: 200, description: 'Lista de asesorías' })
  findAll() {
    return this.advisoriesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiResponse({ status: 404, description: 'Asesoría no encontrada' })
  @ApiResponse({ status: 200, description: 'Asesoría encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.advisoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiResponse({
    status: 200,
    description: 'Asesoría actualizada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o incompletos' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdvisoryDto: UpdateAdvisoryDto,
  ) {
    return this.advisoriesService.update(id, updateAdvisoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiResponse({ status: 200, description: 'Asesoría eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.advisoriesService.remove(id);
  }
}
