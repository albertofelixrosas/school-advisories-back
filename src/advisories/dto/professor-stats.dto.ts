import { ApiProperty } from '@nestjs/swagger';

export class ProfessorStatsDto {
  @ApiProperty({ description: 'Total de asesorías asignadas al profesor' })
  totalAdvisories: number;

  @ApiProperty({ description: 'Total de sesiones de asesoría' })
  totalSessions: number;

  @ApiProperty({ description: 'Total de sesiones próximas' })
  upcomingSessions: number;

  @ApiProperty({ description: 'Total de sesiones completadas' })
  completedSessions: number;

  @ApiProperty({ description: 'Total de estudiantes atendidos' })
  totalStudents: number;

  @ApiProperty({ description: 'Tasa promedio de asistencia (%)' })
  averageAttendanceRate: number;

  @ApiProperty({ description: 'Sesiones por materia', type: 'object', example: { "Matemáticas": 5, "Física": 3 } })
  sessionsBySubject: Record<string, number>;

  @ApiProperty({ description: 'Sesiones esta semana' })
  sessionsThisWeek: number;

  @ApiProperty({ description: 'Sesiones este mes' })
  sessionsThisMonth: number;
}
