import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Length,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Ana', description: 'Nombre del estudiante' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'García', description: 'Apellido del estudiante' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  last_name: string;

  @ApiProperty({
    example: 'ana.garcia@escuela.edu',
    description: 'Correo del estudiante',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '6627654321',
    description: 'Teléfono del estudiante',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    example: 4091,
    description: 'ID interno en la base de datos escolar',
  })
  @IsInt()
  school_id: number;
}
