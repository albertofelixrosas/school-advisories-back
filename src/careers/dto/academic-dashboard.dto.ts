import { ApiProperty } from '@nestjs/swagger';

export class CareerSummaryDto {
  @ApiProperty({ example: 1 })
  career_id: number;

  @ApiProperty({ example: 'Ingeniería en Software' })
  name: string;

  @ApiProperty({ example: 'ISW' })
  code: string;

  @ApiProperty({ example: 120 })
  students_count: number;

  @ApiProperty({ example: 3 })
  study_plans_count: number;

  @ApiProperty({ example: 50 })
  subjects_count: number;

  @ApiProperty({ example: 85 })
  average_attendance_rate: number;
}

export class StudyPlanDistributionDto {
  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: 'Plan 2023 - Ingeniería en Software' })
  plan_name: string;

  @ApiProperty({ example: 45 })
  students_count: number;
}

export class AcademicDashboardDto {
  @ApiProperty({ type: () => [CareerSummaryDto] })
  careers: CareerSummaryDto[];

  @ApiProperty({ type: () => [StudyPlanDistributionDto] })
  study_plans_distribution: StudyPlanDistributionDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      total_careers: { type: 'number', example: 8 },
      total_students: { type: 'number', example: 450 },
      total_study_plans: { type: 'number', example: 10 },
      total_subjects: { type: 'number', example: 80 },
      students_with_career_assigned: { type: 'number', example: 420 },
      students_without_career: { type: 'number', example: 30 },
    },
  })
  summary: {
    total_careers: number;
    total_students: number;
    total_study_plans: number;
    total_subjects: number;
    students_with_career_assigned: number;
    students_without_career: number;
  };
}
