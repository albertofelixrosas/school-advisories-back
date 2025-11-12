import {
  IsInt,
  IsArray,
  ValidateNested,
  IsEnum,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WeekDay } from '../../common/week-day.enum';

class ScheduleDto {
  @ApiProperty({
    enum: WeekDay,
    description: 'Día de la semana (por ejemplo: MONDAY, TUESDAY...)',
  })
  @IsEnum(WeekDay)
  day: WeekDay;

  @ApiProperty({
    example: '08:30',
    description: 'Hora de inicio en formato HH:mm (24h)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'begin_time must be in HH:mm format',
  })
  begin_time: string;

  @ApiProperty({
    example: '10:00',
    description: 'Hora de finalización en formato HH:mm (24h)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'end_time must be in HH:mm format',
  })
  end_time: string;
}

export class CreateAdvisoryDto {
  @ApiProperty({ example: 1, description: 'ID del profesor' })
  @IsInt()
  professor_id: number;

  @ApiProperty({ example: 42, description: 'ID del detalle de materia' })
  @IsInt()
  subject_detail_id: number;

  @ApiProperty({ example: 10, description: 'Máximo de estudiantes permitidos' })
  @IsInt()
  @Min(1)
  max_students: number;

  @ApiProperty({
    type: [ScheduleDto],
    description: 'Arreglo de horarios disponibles',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules: ScheduleDto[];
}
