import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { CreateSubjectScheduleDto } from '../../subject-schedules/dto/create-subject-schedule.dto';

export class CreateSubjectDetailDto {
  @ApiProperty({ example: 1, description: 'ID of the subject' })
  @IsInt()
  subject_id: number;

  @ApiProperty({
    example: 42,
    description: 'ID of the professor (user with PROFESSOR role)',
  })
  @IsInt()
  professor_id: number;

  @ApiProperty({
    example: [
      { day: 'MONDAY', startTime: '08:00', endTime: '10:00' },
      { day: 'WEDNESDAY', startTime: '08:00', endTime: '10:00' },
    ],
    description: 'Optional schedules for the subject',
    required: false,
    type: [CreateSubjectScheduleDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubjectScheduleDto)
  schedules?: CreateSubjectScheduleDto[];
}
