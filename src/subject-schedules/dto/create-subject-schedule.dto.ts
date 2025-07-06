import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { WeekDay } from 'src/common/week-day.enum';

export class CreateSubjectScheduleDto {
  @ApiProperty({ example: 'MONDAY', enum: WeekDay })
  @IsEnum(WeekDay)
  day: WeekDay;

  @ApiProperty({ example: '08:00' })
  @IsString()
  start_time: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  end_time: string;
}
