import {
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WeekDay } from '../../common/week-day.enum';

class ScheduleDto {
  @ApiPropertyOptional({
    enum: WeekDay,
    description: 'Día de la semana (por ejemplo: MONDAY, TUESDAY...)',
  })
  @IsEnum(WeekDay)
  day: WeekDay;

  @ApiPropertyOptional({
    example: '08:30',
    description: 'Hora de inicio en formato HH:mm (24h)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'begin_time must be in HH:mm format',
  })
  begin_time: string;

  @ApiPropertyOptional({
    example: '10:00',
    description: 'Hora de finalización en formato HH:mm (24h)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'end_time must be in HH:mm format',
  })
  end_time: string;
}

export class UpdateAdvisoryDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del profesor' })
  @IsOptional()
  @IsInt()
  professor_id?: number;

  @ApiPropertyOptional({
    example: 42,
    description: 'ID del detalle de materia',
  })
  @IsOptional()
  @IsInt()
  subject_detail_id?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Máximo de estudiantes permitidos',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_students?: number;

  @ApiPropertyOptional({
    type: [ScheduleDto],
    description:
      'Arreglo de horarios disponibles (sobrescribirá los existentes)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules?: ScheduleDto[];
}
