import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/user-role.enum';

// Interfaces específicas para reemplazar tipos 'any'
export interface AppointmentSummary {
  advisory_date_id?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  professor_name?: string;
  subject_name?: string;
  status?: string;
}

export interface SubjectSummary {
  subject_id: number;
  name: string;
  // Campos opcionales para futuras expansiones
  professor_name?: string;
  schedule?: string;
  credits?: number;
}

export interface ScheduleEntry {
  schedule_id?: number;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  subject_name?: string;
}

export class BaseUserInfoDto {
  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'jdoe2024' })
  username: string;

  @ApiProperty({ example: 'juan.doe@university.edu' })
  email: string;

  @ApiProperty({ example: 'Juan Carlos' })
  name: string;

  @ApiProperty({ example: 'Pérez García' })
  last_name: string;

  @ApiProperty({ example: '+526441234567' })
  phone_number: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', nullable: true })
  photo_url?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2024-10-09T15:30:00.000Z' })
  updated_at: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  role: UserRole;
}

export class StudentProfileDto {
  @ApiProperty({ example: 'ST2024001' })
  student_id: string;

  @ApiProperty({ example: 'Ingeniería en Sistemas Computacionales' })
  career: string;

  @ApiProperty({ example: 5 })
  semester: number;

  @ApiProperty({ example: '2024001' })
  student_code: string;

  @ApiProperty({ example: '2024-08-15T00:00:00.000Z' })
  enrollment_date: string;

  @ApiProperty({ example: 'active' })
  academic_status: string;
}

export class StudentStatisticsDto {
  @ApiProperty({ example: 15 })
  total_appointments: number;

  @ApiProperty({ example: 12 })
  completed_sessions: number;

  @ApiProperty({ example: 3 })
  active_appointments: number;

  @ApiProperty({ example: 24 })
  total_hours_received: number;
}

export class RecentActivityDto {
  @ApiProperty({
    type: Object,
    nullable: true,
    description: 'Última cita programada',
  })
  last_appointment?: AppointmentSummary | null;

  @ApiProperty({ type: [Object], description: 'Citas próximas programadas' })
  upcoming_appointments: AppointmentSummary[];

  @ApiProperty({
    type: [Object],
    description: 'Citas completadas recientemente',
  })
  recently_completed: AppointmentSummary[];
}

export class StudentProfileResponseDto {
  @ApiProperty({ type: BaseUserInfoDto })
  user_info: BaseUserInfoDto;

  @ApiProperty({ type: StudentProfileDto })
  student_profile: StudentProfileDto;

  @ApiProperty({ type: StudentStatisticsDto })
  statistics: StudentStatisticsDto;

  @ApiProperty({ type: RecentActivityDto })
  recent_activity: RecentActivityDto;
}

export class ProfessorProfileDto {
  @ApiProperty({ example: 'PR2024001' })
  employee_id: string;

  @ApiProperty({ example: 'Departamento de Sistemas y Computación' })
  department: string;

  @ApiProperty({ example: 'Facultad de Ingeniería' })
  faculty: string;

  @ApiProperty({ example: 'EMP001' })
  employee_code: string;

  @ApiProperty({ example: '2020-02-01T00:00:00.000Z' })
  hire_date: string;

  @ApiProperty({ example: 'Maestro en Ciencias de la Computación' })
  academic_degree: string;

  @ApiProperty({
    example: ['Programación', 'Estructuras de Datos', 'Algoritmos'],
  })
  specialties: string[];

  @ApiProperty({ example: 'Edificio A, Oficina 201' })
  office_location: string;

  @ApiProperty({ example: 'Lunes a Viernes 10:00-12:00' })
  office_hours: string;
}

export class AssignedSubjectsDto {
  @ApiProperty({
    type: [Object],
    description: 'Materias asignadas al profesor',
  })
  subjects: SubjectSummary[];

  @ApiProperty({ example: 3 })
  total_subjects: number;
}

export class ProfessorStatisticsDto {
  @ApiProperty({ example: 8 })
  total_advisories: number;

  @ApiProperty({ example: 5 })
  active_advisories: number;

  @ApiProperty({ example: 45 })
  total_students_helped: number;

  @ApiProperty({ example: 120 })
  total_hours_taught: number;

  @ApiProperty({ example: 4.7 })
  average_rating: number;
}

export class AvailabilityDto {
  @ApiProperty({ type: [Object], description: 'Horario actual del profesor' })
  current_schedule: ScheduleEntry[];

  @ApiProperty({ example: '2024-10-10T10:00:00.000Z' })
  next_available_slot: string;
}

export class ProfessorProfileResponseDto {
  @ApiProperty({ type: BaseUserInfoDto })
  user_info: BaseUserInfoDto;

  @ApiProperty({ type: ProfessorProfileDto })
  professor_profile: ProfessorProfileDto;

  @ApiProperty({ type: AssignedSubjectsDto })
  assigned_subjects: AssignedSubjectsDto;

  @ApiProperty({ type: ProfessorStatisticsDto })
  statistics: ProfessorStatisticsDto;

  @ApiProperty({ type: AvailabilityDto })
  availability: AvailabilityDto;
}

export class AdminProfileDto {
  @ApiProperty({ example: 'ADM001' })
  employee_id: string;

  @ApiProperty({ example: 'Administración Académica' })
  department: string;

  @ApiProperty({ example: 'Coordinador de Asesorías' })
  position: string;

  @ApiProperty({ example: 'full' })
  access_level: string;

  @ApiProperty({ example: ['users_management', 'system_config', 'reports'] })
  permissions: string[];

  @ApiProperty({ example: 'EMP002' })
  employee_code: string;
}

export class SystemInfoDto {
  @ApiProperty({ example: '2024-10-09T15:30:00.000Z' })
  last_login: string;

  @ApiProperty({ example: 156 })
  total_logins: number;

  @ApiProperty({ example: ['Usuarios', 'Asesorías', 'Reportes'] })
  managed_areas: string[];
}

export class AdminProfileResponseDto {
  @ApiProperty({ type: BaseUserInfoDto })
  user_info: BaseUserInfoDto;

  @ApiProperty({ type: AdminProfileDto })
  admin_profile: AdminProfileDto;

  @ApiProperty({ type: SystemInfoDto })
  system_info: SystemInfoDto;
}

export class ProfileErrorDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Usuario no encontrado' })
  message: string;

  @ApiProperty({ example: 404 })
  status_code: number;
}
