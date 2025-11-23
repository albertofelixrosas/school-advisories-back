import { ApiProperty } from '@nestjs/swagger';

class ProfessorOverviewDto {
  @ApiProperty({
    example: 12,
    description: 'Total de asesorías activas del profesor',
  })
  total_active_advisories: number;

  @ApiProperty({
    example: 5,
    description: 'Solicitudes de asesoría pendientes de responder',
  })
  pending_requests: number;

  @ApiProperty({
    example: 45,
    description: 'Número de estudiantes atendidos este mes',
  })
  students_helped_this_month: number;

  @ApiProperty({
    example: 8,
    description: 'Sesiones próximas programadas',
  })
  upcoming_sessions: number;
}

class ProfessorAdvisoryDto {
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
    example: '2025-11-25T10:00:00Z',
    description: 'Fecha de la próxima sesión',
  })
  next_session_date: string | null;

  @ApiProperty({
    example: 15,
    description: 'Número de estudiantes inscritos',
  })
  enrolled_students: number;

  @ApiProperty({
    example: 5,
    description: 'Sesiones completadas',
  })
  completed_sessions: number;
}

class ProfessorAvailabilitySlotDto {
  @ApiProperty({
    example: 1,
    description: 'ID del slot de disponibilidad',
  })
  availability_id: number;

  @ApiProperty({
    example: 'Monday',
    description: 'Día de la semana',
  })
  day_of_week: string;

  @ApiProperty({
    example: '10:00',
    description: 'Hora de inicio',
  })
  start_time: string;

  @ApiProperty({
    example: '12:00',
    description: 'Hora de fin',
  })
  end_time: string;

  @ApiProperty({
    example: 'CLASSROOM',
    description: 'Tipo de lugar (CLASSROOM, OFFICE, VIRTUAL)',
  })
  venue_type: string;

  @ApiProperty({
    example: 'Edificio 5M - Sala 202',
    description: 'Nombre del lugar',
  })
  venue_name: string;
}

class ProfessorRecentActivityDto {
  @ApiProperty({
    type: [ProfessorAdvisoryDto],
    description: 'Últimas asesorías programadas',
  })
  last_advisories: ProfessorAdvisoryDto[];

  @ApiProperty({
    type: ProfessorAvailabilitySlotDto,
    nullable: true,
    description: 'Próximo horario de disponibilidad',
  })
  next_availability_slot: ProfessorAvailabilitySlotDto | null;
}

class ProfessorStatisticsDto {
  @ApiProperty({
    example: 8,
    description: 'Total de materias que imparte',
  })
  total_subjects: number;

  @ApiProperty({
    example: 120.5,
    description: 'Total de horas impartidas este semestre',
  })
  total_hours_this_semester: number;

  @ApiProperty({
    example: 4.7,
    description: 'Calificación promedio del profesor',
  })
  average_rating: number;

  @ApiProperty({
    example: 92.5,
    description: 'Tasa de finalización de asesorías (%)',
  })
  completion_rate: number;

  @ApiProperty({
    example: 156,
    description: 'Total de estudiantes atendidos',
  })
  total_students_helped: number;
}

export class ProfessorDashboardStatsDto {
  @ApiProperty({
    type: ProfessorOverviewDto,
    description: 'Resumen general del profesor',
  })
  overview: ProfessorOverviewDto;

  @ApiProperty({
    type: ProfessorRecentActivityDto,
    description: 'Actividad reciente del profesor',
  })
  recent_activity: ProfessorRecentActivityDto;

  @ApiProperty({
    type: ProfessorStatisticsDto,
    description: 'Estadísticas del profesor',
  })
  statistics: ProfessorStatisticsDto;
}
