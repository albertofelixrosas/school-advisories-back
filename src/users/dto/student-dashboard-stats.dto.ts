import { ApiProperty } from '@nestjs/swagger';

class NextAdvisoryDto {
  @ApiProperty({ example: 1 })
  advisory_id: number;

  @ApiProperty({ example: 'Cálculo Diferencial - Grupo A' })
  title: string;

  @ApiProperty({ example: 'Cálculo Diferencial' })
  subject_name: string;

  @ApiProperty({ example: 'Dr. Juan Pérez' })
  professor_name: string;

  @ApiProperty({ example: '2025-11-25T10:00:00Z' })
  next_session_date: string;

  @ApiProperty({ example: 'Edificio 5M - Sala 202' })
  venue: string;
}

class StudentOverviewDto {
  @ApiProperty({
    example: 3,
    description: 'Asesorías activas en las que está inscrito',
  })
  active_advisories: number;

  @ApiProperty({
    example: 8,
    description: 'Asesorías completadas',
  })
  completed_advisories: number;

  @ApiProperty({
    example: 2,
    description: 'Solicitudes de asesoría pendientes',
  })
  pending_requests: number;

  @ApiProperty({
    type: NextAdvisoryDto,
    nullable: true,
    description: 'Próxima asesoría programada',
  })
  next_advisory: NextAdvisoryDto | null;
}

class StudentAdvisoryDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la asesoría',
  })
  advisory_id: number;

  @ApiProperty({
    example: 'Cálculo Diferencial - Grupo A',
    description: 'Título de la asesoría',
  })
  title: string;

  @ApiProperty({
    example: 'Cálculo Diferencial',
    description: 'Nombre de la materia',
  })
  subject_name: string;

  @ApiProperty({
    example: 'Dr. Juan Pérez',
    description: 'Nombre del profesor',
  })
  professor_name: string;

  @ApiProperty({
    example: '2025-11-25T10:00:00Z',
    description: 'Fecha de la última sesión asistida',
  })
  last_attended_date: string | null;

  @ApiProperty({
    example: 5,
    description: 'Sesiones asistidas',
  })
  sessions_attended: number;

  @ApiProperty({
    example: 6,
    description: 'Total de sesiones',
  })
  total_sessions: number;

  @ApiProperty({
    example: 83.33,
    description: 'Porcentaje de asistencia',
  })
  attendance_percentage: number;
}

class StudentProfessorDto {
  @ApiProperty({
    example: 1,
    description: 'ID del profesor',
  })
  user_id: number;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del profesor',
  })
  name: string;

  @ApiProperty({
    example: 'Pérez García',
    description: 'Apellido del profesor',
  })
  last_name: string;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL de la foto del profesor',
  })
  photo_url: string | null;

  @ApiProperty({
    example: 'Cálculo Diferencial',
    description: 'Materia que imparte',
  })
  subject: string;

  @ApiProperty({
    example: 2,
    description: 'Asesorías disponibles',
  })
  available_advisories: number;
}

class StudentRecentActivityDto {
  @ApiProperty({
    type: [StudentAdvisoryDto],
    description: 'Asesorías recientes del estudiante',
  })
  recent_advisories: StudentAdvisoryDto[];

  @ApiProperty({
    type: [StudentProfessorDto],
    description: 'Profesores disponibles',
  })
  available_professors: StudentProfessorDto[];
}

class StudentStatisticsDto {
  @ApiProperty({
    example: 15,
    description: 'Total de asesorías a las que ha asistido',
  })
  total_advisories_attended: number;

  @ApiProperty({
    type: [String],
    example: ['Cálculo Diferencial', 'Álgebra Lineal', 'Física I'],
    description: 'Materias cubiertas en asesorías',
  })
  subjects_covered: string[];

  @ApiProperty({
    example: 32.5,
    description: 'Total de horas de asesorías recibidas',
  })
  total_hours_received: number;

  @ApiProperty({
    example: 88.5,
    description: 'Porcentaje promedio de asistencia',
  })
  average_attendance_rate: number;
}

export class StudentDashboardStatsDto {
  @ApiProperty({
    type: StudentOverviewDto,
    description: 'Resumen general del estudiante',
  })
  overview: StudentOverviewDto;

  @ApiProperty({
    type: StudentRecentActivityDto,
    description: 'Actividad reciente del estudiante',
  })
  recent_activity: StudentRecentActivityDto;

  @ApiProperty({
    type: StudentStatisticsDto,
    description: 'Estadísticas del estudiante',
  })
  statistics: StudentStatisticsDto;
}
