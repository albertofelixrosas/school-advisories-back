import { ApiProperty } from '@nestjs/swagger';

export class SessionScheduleDto {
  @ApiProperty()
  advisory_schedule_id: number;

  @ApiProperty()
  day: string;

  @ApiProperty()
  begin_time: string;

  @ApiProperty()
  end_time: string;
}

export class SessionSubjectDto {
  @ApiProperty()
  subject_id: number;

  @ApiProperty()
  subject_name: string;

  @ApiProperty({ type: [Object] })
  schedules: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

export class SessionProfessorDto {
  @ApiProperty()
  user_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  photo_url?: string | null;

  @ApiProperty({ nullable: true })
  phone_number?: string | null;
}

export class SessionVenueDto {
  @ApiProperty()
  venue_id: number;

  @ApiProperty()
  building: string;

  @ApiProperty()
  classroom: string;

  @ApiProperty()
  capacity: number;
}

export class SessionAttendanceDto {
  @ApiProperty()
  student_id: number;

  @ApiProperty()
  student_enrollment_id: string;

  @ApiProperty()
  student_name: string;

  @ApiProperty()
  student_last_name: string;

  @ApiProperty()
  attended: boolean;

  @ApiProperty({ nullable: true })
  notes?: string | null;
}

export class FullSessionDetailsDto {
  @ApiProperty()
  advisory_date_id: number;

  @ApiProperty()
  advisory_id: number;

  @ApiProperty()
  topic: string;

  @ApiProperty({ description: 'Session date and time (ISO 8601)' })
  date: string;

  @ApiProperty({ nullable: true })
  notes?: string | null;

  @ApiProperty({ nullable: true })
  session_link?: string | null;

  @ApiProperty({ nullable: true })
  completed_at?: Date | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ type: SessionVenueDto })
  venue: SessionVenueDto;

  @ApiProperty({ type: SessionSubjectDto })
  subject: SessionSubjectDto;

  @ApiProperty({ type: SessionProfessorDto })
  professor: SessionProfessorDto;

  @ApiProperty()
  max_students: number;

  @ApiProperty({ type: [SessionScheduleDto] })
  advisory_schedules: SessionScheduleDto[];

  @ApiProperty({ type: [SessionAttendanceDto] })
  attendances: SessionAttendanceDto[];

  @ApiProperty()
  registered_students_count: number;

  @ApiProperty()
  attended_count: number;

  @ApiProperty()
  attendance_rate: number;

  @ApiProperty()
  is_completed: boolean;

  @ApiProperty()
  is_upcoming: boolean;
}
