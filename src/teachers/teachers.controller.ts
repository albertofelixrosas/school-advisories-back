import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo maestro' })
  @ApiCreatedResponse({ description: 'Maestro creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los maestros' })
  @ApiOkResponse({ description: 'Lista de maestros' })
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un maestro por ID' })
  @ApiOkResponse({ description: 'Maestro encontrado' })
  @ApiNotFoundResponse({ description: 'Maestro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un maestro por ID' })
  @ApiOkResponse({ description: 'Maestro actualizado exitosamente' })
  @ApiNotFoundResponse({ description: 'Maestro no encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un maestro por ID' })
  @ApiOkResponse({ description: 'Maestro eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Maestro no encontrado' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(+id);
  }
}
