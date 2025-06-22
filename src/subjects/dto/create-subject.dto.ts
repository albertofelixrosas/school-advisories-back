import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({
    example: 'Programación 1',
    description: 'Nombre de la materia',
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena' })
  @Length(1, 100)
  name: string;
}
