import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
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

@ApiTags('Subjects')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard) // Asegura que solo usuarios autenticados puedan acceder
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva materia' })
  @ApiCreatedResponse({ description: 'Materia creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    try {
      return this.subjectsService.create(createSubjectDto);
    } catch (error) {
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al crear la materia:', error.message);
      }
      return {
        statusCode: 400,
        message:
          error instanceof Error ? error.message : 'Error al crear la materia',
        error: 'Bad Request',
      };
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas las materias' })
  @ApiOkResponse({ description: 'Lista de materias' })
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener una materia por ID' })
  @ApiOkResponse({ description: 'Materia encontrada' })
  @ApiNotFoundResponse({ description: 'Materia no encontrada' })
  findOne(@Param('id') id: string) {
    try {
      return this.subjectsService.findOne(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: `Materia con ID ${id} no encontrada`,
          error: 'Not Found',
        };
      }
      // Log other unexpected errors
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al obtener la materia:', error.message);
      }
      return {
        statusCode: 500,
        message: 'Error interno del servidor al obtener la materia',
        error: 'Internal Server Error',
      };
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una materia por ID' })
  @ApiOkResponse({ description: 'Materia actualizada exitosamente' })
  @ApiNotFoundResponse({ description: 'Materia no encontrada' })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    try {
      return this.subjectsService.update(+id, updateSubjectDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: `Materia con ID ${id} no encontrada`,
          error: 'Not Found',
        };
      }
      // Log other unexpected errors
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al actualizar la materia:', error.message);
      }
      return {
        statusCode: 500,
        message: 'Error interno del servidor al actualizar la materia',
        error: 'Internal Server Error',
      };
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una materia por ID' })
  @ApiOkResponse({ description: 'Materia eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Materia no encontrada' })
  remove(@Param('id') id: string) {
    try {
      return this.subjectsService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: `Materia con ID ${id} no encontrada`,
          error: 'Not Found',
        };
      }
      // Log other unexpected errors
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al eliminar la materia:', error.message);
      }
      return {
        statusCode: 500,
        message: 'Error interno del servidor al eliminar la materia',
        error: 'Internal Server Error',
      };
    }
  }
}
