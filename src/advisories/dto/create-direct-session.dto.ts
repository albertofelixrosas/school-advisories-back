import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SessionScheduleDto {
  @ApiProperty({ example: 'MONDAY', description: 'Día de la semana' })
  @IsNotEmpty()
  @IsString()
  day: string;

  @ApiProperty({ example: '10:00', description: 'Hora de inicio' })
  @IsNotEmpty()
  @IsString()
  begin_time: string;

  @ApiProperty({ example: '12:00', description: 'Hora de fin' })
  @IsNotEmpty()
  @IsString()
  end_time: string;
}

export class CreateDirectSessionDto {
  @ApiProperty({ example: 1, description: 'ID del detalle de materia' })
  @IsNotEmpty()
  @IsNumber()
  subject_detail_id: number;

  @ApiProperty({ example: 1, description: 'ID del venue/aula' })
  @IsNotEmpty()
  @IsNumber()
  venue_id: number;

  @ApiProperty({
    example: 'Cálculo Diferencial - Límites',
    description: 'Tema de la asesoría',
  })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({
    example: '2025-11-05T10:00:00.000Z',
    description: 'Fecha y hora de la sesión',
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  session_date: Date;

  @ApiProperty({ example: 15, description: 'Máximo número de estudiantes' })
  @IsNotEmpty()
  @IsNumber()
  max_students: number;

  @ApiProperty({
    example: 'https://meet.google.com/abc-def-ghi',
    description: 'Enlace de sesión virtual (opcional)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  session_link?: string;

  @ApiProperty({
    example: 'Notas adicionales sobre la sesión',
    description: 'Notas o descripción adicional (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [SessionScheduleDto],
    description: 'Horarios de disponibilidad para futuras sesiones',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionScheduleDto)
  schedules: SessionScheduleDto[];

  @ApiProperty({
    type: [Number],
    description: 'IDs de estudiantes a invitar (opcional)',
    required: false,
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  invited_student_ids?: number[];
}
