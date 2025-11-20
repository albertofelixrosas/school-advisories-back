import { ApiProperty } from '@nestjs/swagger';

export class SessionStudentDto {
  @ApiProperty({ description: 'User ID of the student' })
  user_id: number;

  @ApiProperty({ description: 'Student ID (enrollment number)' })
  student_id: string;

  @ApiProperty({ description: 'Student first name' })
  name: string;

  @ApiProperty({ description: 'Student last name' })
  last_name: string;

  @ApiProperty({ description: 'Student email' })
  email: string;

  @ApiProperty({ description: 'Student photo URL', nullable: true })
  photo_url?: string | null;

  @ApiProperty({ description: 'Phone number', nullable: true })
  phone_number?: string | null;

  @ApiProperty({ description: 'Whether the student attended the session' })
  attended: boolean;

  @ApiProperty({ description: 'Attendance notes', nullable: true })
  attendance_notes?: string | null;

  @ApiProperty({
    description: 'How the student joined (invitation or request)',
  })
  join_type: 'invitation' | 'request' | 'attendance';
}

export class SessionDetailsDto {
  @ApiProperty({ description: 'Advisory date ID (session ID)' })
  advisory_date_id: number;

  @ApiProperty({ description: 'Advisory ID' })
  advisory_id: number;

  @ApiProperty({ description: 'Session topic' })
  topic: string;

  @ApiProperty({ description: 'Session date and time (ISO 8601)' })
  date: string;

  @ApiProperty({ description: 'Session notes', nullable: true })
  notes?: string | null;

  @ApiProperty({
    description: 'Session link (virtual meetings)',
    nullable: true,
  })
  session_link?: string | null;

  @ApiProperty({ description: 'Venue information' })
  venue: {
    venue_id: number;
    building: string;
    classroom: string;
    capacity: number;
  };

  @ApiProperty({ description: 'Subject information' })
  subject: {
    subject_id: number;
    subject_name: string;
  };

  @ApiProperty({ description: 'Professor information' })
  professor: {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
    photo_url?: string | null;
  };

  @ApiProperty({ description: 'Maximum capacity for the session' })
  max_students: number;

  @ApiProperty({ description: 'Completion timestamp', nullable: true })
  completed_at?: Date | null;
}

export class SessionStudentsResponseDto {
  @ApiProperty({ type: SessionDetailsDto })
  session: SessionDetailsDto;

  @ApiProperty({ type: [SessionStudentDto] })
  students: SessionStudentDto[];

  @ApiProperty({ description: 'Total number of students' })
  total_students: number;

  @ApiProperty({ description: 'Number of students who attended' })
  attended_count: number;

  @ApiProperty({ description: 'Number of students who did not attend' })
  absent_count: number;

  @ApiProperty({ description: 'Attendance rate percentage' })
  attendance_rate: number;
}
