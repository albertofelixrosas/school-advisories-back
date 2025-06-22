import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    example: 'Jesus Ernesto Perez Aguilar',
    description: 'Nombre del estudiante',
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena' })
  @Length(1, 100)
  name: string;
}
