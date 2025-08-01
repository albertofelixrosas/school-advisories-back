import { ApiProperty } from '@nestjs/swagger';

class ScheduleDto {
  @ApiProperty()
  day: string;

  @ApiProperty()
  begin_time: string;

  @ApiProperty()
  end_time: string;
}

class SubjectScheduleDto {
  @ApiProperty()
  day: string;

  @ApiProperty()
  start_time: string;

  @ApiProperty()
  end_time: string;
}

class SubjectDetailDto {
  @ApiProperty()
  subject_detail_id: number;

  @ApiProperty()
  subject_name: string;

  @ApiProperty({ type: [SubjectScheduleDto] })
  schedules: SubjectScheduleDto[];
}

class ProfessorDto {
  @ApiProperty()
  user_id: number;

  @ApiProperty()
  school_id?: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  photo_url: string;
}

export class AdvisoryResponseDto {
  @ApiProperty()
  advisory_id: number;

  @ApiProperty()
  max_students: number;

  @ApiProperty({ type: ProfessorDto })
  professor: ProfessorDto;

  @ApiProperty({ type: SubjectDetailDto })
  subject_detail: SubjectDetailDto;

  @ApiProperty({ type: [ScheduleDto] })
  schedules: ScheduleDto[];
}
