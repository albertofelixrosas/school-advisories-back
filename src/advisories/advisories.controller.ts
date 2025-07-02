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
} from '@nestjs/common';
import { AdvisoriesService } from './advisories.service';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

@ApiTags('Advisories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('advisories')
export class AdvisoriesController {
  constructor(private readonly advisoriesService: AdvisoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva asesoría' })
  @ApiCreatedResponse({ description: 'Asesoría creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() dto: CreateAdvisoryDto) {
    try {
      return this.advisoriesService.create(dto);
    } catch (error) {
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las asesorías' })
  @ApiOkResponse({ description: 'Lista de asesorías' })
  findAll() {
    return this.advisoriesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
}
