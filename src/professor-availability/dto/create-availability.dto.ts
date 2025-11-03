import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDate,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WeekDay } from '../../common/week-day.enum';

export class CreateAvailabilitySlotDto {
  @ApiProperty({
    example: 1,
    description: 'ID del profesor',
  })
  @IsNumber()
  professor_id: number;

  @ApiProperty({
    example: 1,
    description:
      'ID del detalle de materia (opcional, para disponibilidad específica)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  subject_detail_id?: number;

  @ApiProperty({
    enum: WeekDay,
    example: WeekDay.MONDAY,
    description: 'Día de la semana',
  })
  @IsEnum(WeekDay)
  day_of_week: WeekDay;

  @ApiProperty({
    example: '09:00',
    description: 'Hora de inicio (formato HH:mm)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'start_time must be in HH:mm format',
  })
  start_time: string;

  @ApiProperty({
    example: '12:00',
    description: 'Hora de fin (formato HH:mm)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'end_time must be in HH:mm format',
  })
  end_time: string;

  @ApiProperty({
    example: 5,
    description: 'Máximo de estudiantes por slot',
    minimum: 1,
    maximum: 50,
  })
  @IsNumber()
  @Min(1)
  @Max(50)
  max_students_per_slot: number;

  @ApiProperty({
    example: 30,
    description: 'Duración de cada slot en minutos',
    minimum: 15,
    maximum: 180,
  })
  @IsNumber()
  @Min(15)
  @Max(180)
  slot_duration_minutes: number;

  @ApiProperty({
    example: true,
    description: 'Si la disponibilidad se repite semanalmente',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean = true;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Fecha desde cuando aplica (opcional)',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effective_from?: Date;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Fecha hasta cuando aplica (opcional)',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effective_until?: Date;

  @ApiProperty({
    example: 'Disponible para asesorías presenciales únicamente',
    description: 'Notas adicionales sobre la disponibilidad',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
