import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del maestro' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena' })
  @Length(1, 100)
  name: string;
}
