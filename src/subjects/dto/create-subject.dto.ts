import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Matemáticas', description: 'Nombre de la materia' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  subject: string;
}
