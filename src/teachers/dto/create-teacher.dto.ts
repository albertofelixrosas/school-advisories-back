import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  Length,
  IsInt,
} from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del maestro' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del maestro' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  last_name: string;

  @ApiProperty({
    example: 'juan.perez@escuela.edu',
    description: 'Correo institucional',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '6621234567',
    description: 'Teléfono de contacto',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({ example: 3021, description: 'ID interno de la escuela' })
  @IsInt()
  school_id: number;
}
