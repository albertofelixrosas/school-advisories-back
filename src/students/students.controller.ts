import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UseGuards } from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

// Visión general: Separar User de las entidades de perfil
// https://chatgpt.com/share/685d155b-ec90-8013-814c-9494f92296e7

@ApiTags('Students')
@UseGuards(JwtAuthGuard, RolesGuard) // Asegura que solo usuarios autenticados puedan acceder
@Controller('students')
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo estudiante' })
  @ApiCreatedResponse({ description: 'Estudiante creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() dto: CreateStudentDto) {
    return this.service.create(dto);
  }

  //@UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar estudiantes con paginación (protegido)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ description: 'Lista paginada de estudiantes' })
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener un estudiante por ID' })
  @ApiOkResponse({ description: 'Estudiante encontrado' })
  @ApiNotFoundResponse({ description: 'Estudiante no encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un estudiante por ID' })
  @ApiOkResponse({ description: 'Estudiante actualizado correctamente' })
  @ApiNotFoundResponse({ description: 'Estudiante no encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un estudiante por ID' })
  @ApiOkResponse({ description: 'Estudiante eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Estudiante no encontrado' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
