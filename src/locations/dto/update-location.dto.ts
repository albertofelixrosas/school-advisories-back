import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({
    example: 'Aula 350',
    description: 'Nuevo nombre para el lugar donde se dará la asesoria',
  })
  description?: string;
}
