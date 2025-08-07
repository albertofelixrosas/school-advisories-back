import { PartialType } from '@nestjs/mapped-types';
import { CreateAdvisoryDateDto } from './create-advisory-date.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class UpdateAdvisoryDateDto extends PartialType(CreateAdvisoryDateDto) {
  @ApiPropertyOptional({ example: 1, description: 'ID de la asesoría' })
  @IsOptional()
  @IsInt()
  advisory_id?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID del lugar donde se realizará la asesoría',
  })
  @IsOptional()
  @IsInt()
  venue_id?: number;

  @ApiPropertyOptional({
    example: 'Repaso de funciones',
    description: 'Tema de la asesoría',
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({
    example: '2025-08-15T10:00:00.000Z',
    description: 'Fecha y hora en formato ISO 8601',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description:
      'Lista de IDs de estudiantes que pueden asistir a esta fecha de asesoría',
    required: false,
  })
  @IsArray()
  students?: number[]; // Optional array of student IDs who can attend this advisory date
}
