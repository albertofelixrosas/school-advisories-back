import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/user-role.enum';

export class UserInfoDto {
  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'jdoe2024' })
  username: string;

  @ApiProperty({ example: 'Juan' })
  name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'juan.doe@university.edu' })
  email: string;

  @ApiProperty({ example: '+526441234567', required: false })
  phone_number?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PROFESSOR })
  role: UserRole;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  photo_url?: string;

  @ApiProperty({ example: 1, required: false })
  school_id?: number;

  @ApiProperty({ example: 'ST2024001', required: false })
  student_id?: string;

  @ApiProperty({ example: 'PR2024001', required: false })
  employee_id?: string;
}

export class AuthProfessorStatsDto {
  @ApiProperty({ example: 5 })
  active_advisories_count: number;

  @ApiProperty({ example: 25 })
  total_students_enrolled: number;

  @ApiProperty({ example: 3 })
  upcoming_sessions_count: number;

  @ApiProperty({ example: 12 })
  completed_sessions_count: number;
}

export class StudentStatsDto {
  @ApiProperty({ example: 2 })
  active_appointments_count: number;

  @ApiProperty({ example: 8 })
  completed_sessions_count: number;

  @ApiProperty({ example: 15 })
  available_advisories_count: number;
}

export class AdminStatsDto {
  @ApiProperty({ example: 20 })
  total_professors: number;

  @ApiProperty({ example: 250 })
  total_students: number;

  @ApiProperty({ example: 45 })
  total_advisories: number;

  @ApiProperty({ example: 80 })
  total_sessions_this_month: number;

  @ApiProperty({ example: 10 })
  active_venues: number;
}

export class SubjectDetailDto {
  @ApiProperty({ example: 1 })
  subject_detail_id: number;

  @ApiProperty({
    example: {
      subject_id: 1,
      subject: 'Cálculo Diferencial',
    },
  })
  subject: {
    subject_id: number;
    subject: string;
  };

  @ApiProperty({
    example: [
      {
        subject_schedule_id: 1,
        day: 'monday',
        start_time: '08:00:00',
        end_time: '10:00:00',
      },
    ],
  })
  schedules: Array<{
    subject_schedule_id: number;
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

export class AdvisoryDto {
  @ApiProperty({ example: 1 })
  advisory_id: number;

  @ApiProperty({ example: 'Asesoría de Cálculo - Derivadas' })
  title: string;

  @ApiProperty({ example: 'Repaso de conceptos básicos de derivadas' })
  description: string;

  @ApiProperty({ example: 20 })
  max_students: number;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 15 })
  enrolled_students_count: number;

  @ApiProperty({ example: 'Cálculo Diferencial' })
  subject_name: string;
}

export class AdvisoryDateDto {
  @ApiProperty({ example: 1 })
  advisory_date_id: number;

  @ApiProperty({ example: '2025-10-15T10:00:00.000Z' })
  date: string;

  @ApiProperty({ example: 'Aula 301' })
  venue_name: string;

  @ApiProperty({ example: 5 })
  available_spots: number;

  @ApiProperty({ example: false })
  is_full: boolean;

  @ApiProperty({ example: false })
  is_past: boolean;
}

export class AvailableAdvisoryDto {
  @ApiProperty({ example: 1 })
  advisory_id: number;

  @ApiProperty({ example: 'Cálculo Diferencial' })
  subject_name: string;

  @ApiProperty({ example: 'Dr. Juan Pérez' })
  professor_name: string;

  @ApiProperty({ example: 15 })
  available_spots: number;

  @ApiProperty({ example: 20 })
  max_students: number;

  @ApiProperty({ type: [AdvisoryDateDto] })
  upcoming_dates: AdvisoryDateDto[];
}

export class StudentAppointmentDto {
  @ApiProperty({ example: 1 })
  advisory_attendance_id: number;

  @ApiProperty({ type: AdvisoryDateDto })
  advisory_date: AdvisoryDateDto;

  @ApiProperty({ example: null, nullable: true })
  attended: boolean | null;

  @ApiProperty({ example: '2025-10-01T12:00:00.000Z' })
  registration_date: string;

  @ApiProperty({ example: 'Cálculo Diferencial' })
  subject_name: string;

  @ApiProperty({ example: 'Dr. Juan Pérez' })
  professor_name: string;
}

export class DashboardDataDto {
  @ApiProperty({ type: AuthProfessorStatsDto, required: false })
  professor_stats?: AuthProfessorStatsDto;

  @ApiProperty({ type: StudentStatsDto, required: false })
  student_stats?: StudentStatsDto;

  @ApiProperty({ type: AdminStatsDto, required: false })
  admin_stats?: AdminStatsDto;

  @ApiProperty({ type: [SubjectDetailDto], required: false })
  assigned_subjects?: SubjectDetailDto[];

  @ApiProperty({ type: [AdvisoryDto], required: false })
  active_advisories?: AdvisoryDto[];

  @ApiProperty({ type: [AdvisoryDateDto], required: false })
  upcoming_advisory_dates?: AdvisoryDateDto[];

  @ApiProperty({ type: [AvailableAdvisoryDto], required: false })
  available_advisories?: AvailableAdvisoryDto[];

  @ApiProperty({ type: [StudentAppointmentDto], required: false })
  my_appointments?: StudentAppointmentDto[];
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;

  @ApiProperty({ example: 'jdoe2024' })
  username: string;

  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({ type: DashboardDataDto })
  dashboard_data: DashboardDataDto;
}
