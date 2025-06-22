import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva materia' })
  @ApiCreatedResponse({ description: 'Materia creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las materias' })
  @ApiOkResponse({ description: 'Lista de materias' })
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una materia por ID' })
  @ApiOkResponse({ description: 'Materia encontrada' })
  @ApiNotFoundResponse({ description: 'Materia no encontrada' })
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una materia por ID' })
  @ApiOkResponse({ description: 'Materia actualizada exitosamente' })
  @ApiNotFoundResponse({ description: 'Materia no encontrada' })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(+id, updateSubjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una materia por ID' })
  @ApiOkResponse({ description: 'Materia eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Materia no encontrada' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }
}
