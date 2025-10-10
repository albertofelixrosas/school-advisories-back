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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

@ApiTags('Advisories')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('advisories')
export class AdvisoriesController {
  constructor(private readonly advisoriesService: AdvisoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Crear una nueva asesoría' })
  @ApiCreatedResponse({ description: 'Asesoría creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() dto: CreateAdvisoryDto) {
    try {
      console.log('Crear asesoría con datos:', dto);
      return this.advisoriesService.create(dto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        };
      }
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
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener todas las asesorías' })
  @ApiOkResponse({ description: 'Lista de asesorías' })
  findAll() {
    return this.advisoriesService.findAll();
  }

  @Get('professor/:professorId')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
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
    try {
      return await this.advisoriesService.findByProfessor(professorId);
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
        console.error(
          'Error al obtener asesorías del profesor:',
          error.message,
        );
      }
      return {
        statusCode: 500,
        message: 'Error interno del servidor al obtener las asesorías',
        error: 'Internal Server Error',
      };
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT)
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
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
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
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
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
