import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsArray,
  IsInt,
  Matches,
} from 'class-validator';

export class CreateAdvisoryDto {
  @ApiProperty({ example: '2025-06-25', description: 'Fecha de la asesoría' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    example: '10:00',
    description: 'Hora de inicio (formato HH:mm)',
  })
  @IsNotEmpty()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato de hora inválido',
  })
  begin_time: string;

  @ApiProperty({ example: '11:30', description: 'Hora de fin (formato HH:mm)' })
  @IsNotEmpty()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato de hora inválido',
  })
  end_time: string;

  @ApiProperty({ example: 1, description: 'ID del maestro' })
  @IsInt()
  teacher_id: number;

  @ApiProperty({ example: 3, description: 'ID de la materia' })
  @IsInt()
  subject_id: number;

  @ApiProperty({ example: 2, description: 'ID del lugar' })
  @IsInt()
  location_id: number;

  @ApiProperty({ example: [1, 2, 3], description: 'IDs de los estudiantes' })
  @IsArray()
  @IsInt({ each: true })
  students: number[];
}
