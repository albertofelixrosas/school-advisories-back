import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @ApiProperty({
    example: 'Juan de Jesús Pérez',
    description: 'Nombre del maestro',
  })
  name?: string;
}
