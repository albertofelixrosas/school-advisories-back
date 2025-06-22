import { PartialType } from '@nestjs/mapped-types';
import { CreateSubjectDto } from './create-subject.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {
  @ApiProperty({
    example: 'Programación 1',
    description: 'Nuevo nombre de la materia',
  })
  name?: string;
}
