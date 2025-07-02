import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  Matches,
  IsInt,
  IsArray,
  IsString,
} from 'class-validator';

export class UpdateAdvisoryDto {
  @ApiPropertyOptional({ example: '2025-06-25', description: 'Nueva fecha' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: '09:00',
    description: 'Nueva hora de inicio',
  })
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato de hora inválido',
  })
  begin_time?: string;

  @ApiPropertyOptional({ example: '10:30', description: 'Nueva hora de fin' })
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato de hora inválido',
  })
  end_time?: string;

  @ApiPropertyOptional({ example: 4, description: 'Nuevo ID del maestro' })
  @IsOptional()
  @IsInt()
  teacher_id?: number;

  @ApiPropertyOptional({ example: 5, description: 'Nuevo ID de la materia' })
  @IsOptional()
  @IsInt()
  subject_id?: number;

  @ApiPropertyOptional({ example: 6, description: 'Nuevo ID del lugar' })
  @IsOptional()
  @IsInt()
  venue_id?: number;

  @ApiPropertyOptional({
    example: [2, 4],
    description: 'Nuevos IDs de los estudiantes',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  students?: number[];

  @ApiPropertyOptional({
    example: 'Se agregaron nuevos temas a la asesoría',
    description: 'Nueva descripción',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
