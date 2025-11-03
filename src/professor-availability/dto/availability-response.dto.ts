import { IsNumber, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WeekDay } from '../../common/week-day.enum';

export class GetAvailabilityQueryDto {
  @ApiProperty({
    example: 1,
    description: 'ID del profesor',
  })
  @IsNumber()
  @Type(() => Number)
  professor_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID del detalle de materia (opcional)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subject_detail_id?: number;

  @ApiProperty({
    enum: WeekDay,
    example: WeekDay.MONDAY,
    description: 'Día específico (opcional)',
    required: false,
  })
  @IsOptional()
  @IsEnum(WeekDay)
  day_of_week?: WeekDay;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Fecha específica para consultar disponibilidad (opcional)',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
}

export class AvailabilitySlotResponseDto {
  availability_id: number;
  professor_id: number;
  subject_detail_id?: number;
  day_of_week: WeekDay;
  start_time: string;
  end_time: string;
  max_students_per_slot: number;
  slot_duration_minutes: number;
  is_active: boolean;
  is_recurring: boolean;
  effective_from?: Date;
  effective_until?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;

  // Información adicional para la respuesta
  professor?: {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
  };

  subject_detail?: {
    subject_detail_id: number;
    subject_name: string;
  };

  // Estadísticas del slot
  current_bookings?: number;
  available_spots?: number;
}

export class BulkAvailabilityDto {
  @ApiProperty({
    example: 1,
    description: 'ID del profesor',
  })
  @IsNumber()
  professor_id: number;

  @ApiProperty({
    type: [CreateAvailabilitySlotDto],
    description: 'Lista de slots de disponibilidad a crear',
  })
  slots: Omit<CreateAvailabilitySlotDto, 'professor_id'>[];
}

// Importar CreateAvailabilitySlotDto al final para evitar dependencia circular
import { CreateAvailabilitySlotDto } from './create-availability.dto';
