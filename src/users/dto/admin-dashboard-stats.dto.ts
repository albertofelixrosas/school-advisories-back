import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ description: 'Total number of users' })
  total: number;

  @ApiProperty({ description: 'Number of students' })
  students: number;

  @ApiProperty({ description: 'Number of professors' })
  professors: number;

  @ApiProperty({ description: 'Number of admins' })
  admins: number;

  @ApiProperty({ description: 'Recently registered users (last 30 days)' })
  recent_registrations: number;
}

export class AdvisoryStatsDto {
  @ApiProperty({ description: 'Total number of advisories' })
  total: number;

  @ApiProperty({ description: 'Number of active/upcoming advisories' })
  active: number;

  @ApiProperty({ description: 'Number of completed advisories' })
  completed: number;

  @ApiProperty({ description: 'Average students per advisory' })
  avg_students_per_session: number;
}

export class SessionStatsDto {
  @ApiProperty({ description: 'Total number of sessions (advisory dates)' })
  total: number;

  @ApiProperty({ description: 'Number of upcoming sessions' })
  upcoming: number;

  @ApiProperty({ description: 'Number of completed sessions' })
  completed: number;

  @ApiProperty({ description: 'Sessions scheduled for this week' })
  this_week: number;

  @ApiProperty({ description: 'Sessions scheduled for this month' })
  this_month: number;
}

export class RequestStatsDto {
  @ApiProperty({ description: 'Total number of advisory requests' })
  total: number;

  @ApiProperty({ description: 'Number of pending requests' })
  pending: number;

  @ApiProperty({ description: 'Number of approved requests' })
  approved: number;

  @ApiProperty({ description: 'Number of rejected requests' })
  rejected: number;

  @ApiProperty({ description: 'Average response time in hours' })
  avg_response_time_hours: number;
}

export class AttendanceStatsDto {
  @ApiProperty({ description: 'Total attendance records' })
  total_records: number;

  @ApiProperty({ description: 'Number of attended sessions' })
  attended: number;

  @ApiProperty({ description: 'Attendance rate percentage' })
  attendance_rate: number;
}

export class SubjectStatsDto {
  @ApiProperty({ description: 'Total number of subjects' })
  total: number;

  @ApiProperty({ description: 'Number of subjects with assigned professors' })
  with_professors: number;

  @ApiProperty({ description: 'Number of active advisories' })
  active_advisories: number;
}

export class TopSubject {
  @ApiProperty()
  subject_id: number;

  @ApiProperty()
  subject_name: string;

  @ApiProperty()
  sessions_count: number;

  @ApiProperty()
  students_served: number;
}

export class TopProfessor {
  @ApiProperty()
  user_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  sessions_count: number;

  @ApiProperty()
  students_served: number;

  @ApiProperty()
  avg_rating: number;
}

export class AdminDashboardStatsDto {
  @ApiProperty({ type: UserStatsDto })
  users: UserStatsDto;

  @ApiProperty({ type: AdvisoryStatsDto })
  advisories: AdvisoryStatsDto;

  @ApiProperty({ type: SessionStatsDto })
  sessions: SessionStatsDto;

  @ApiProperty({ type: RequestStatsDto })
  requests: RequestStatsDto;

  @ApiProperty({ type: AttendanceStatsDto })
  attendance: AttendanceStatsDto;

  @ApiProperty({ type: SubjectStatsDto })
  subjects: SubjectStatsDto;

  @ApiProperty({ type: [TopSubject] })
  top_subjects: TopSubject[];

  @ApiProperty({ type: [TopProfessor] })
  top_professors: TopProfessor[];
}
