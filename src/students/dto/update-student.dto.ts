import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({
    example: 'Miguel Ernesto Perez Aguilar',
    description: 'Nuevo nombre para el estudiante',
  })
  name?: string;
}
