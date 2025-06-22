import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateLocationDto {
  @ApiPropertyOptional({
    example: 'Aula 670',
    description: 'El nombre para el lugar donde se dará la asesoria',
  })
  @IsNotEmpty({ message: 'La descripción no puede estar vacío' })
  @IsString({ message: 'La descripción debe ser una cadena' })
  @Length(1, 100)
  description: string;
}
