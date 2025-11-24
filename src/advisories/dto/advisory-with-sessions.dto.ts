import { ApiProperty } from '@nestjs/swagger';

class SessionVenueDto {
  @ApiProperty()
  venue_id: number;

  @ApiProperty()
  building: string;

  @ApiProperty()
  name: string;
}

class AdvisorySessionDto {
  @ApiProperty()
  advisory_date_id: number;

  @ApiProperty()
  topic: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  notes: string | null;

  @ApiProperty()
  session_link: string | null;

  @ApiProperty()
  completed_at: Date | null;

  @ApiProperty({ type: SessionVenueDto })
  venue: SessionVenueDto;

  @ApiProperty()
  attendances_count: number;

  @ApiProperty()
  attended_count: number;

  @ApiProperty()
  is_upcoming: boolean;

  @ApiProperty()
  is_completed: boolean;
}

class ScheduleDto {
  @ApiProperty()
  advisory_schedule_id: number;

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

export class AdvisoryWithSessionsDto {
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

  @ApiProperty({ type: [AdvisorySessionDto] })
  sessions: AdvisorySessionDto[];

  @ApiProperty()
  total_sessions: number;

  @ApiProperty()
  upcoming_sessions: number;

  @ApiProperty()
  completed_sessions: number;
}
