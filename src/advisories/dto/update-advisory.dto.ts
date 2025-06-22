import { PartialType } from '@nestjs/mapped-types';
import { CreateAdvisoryDto } from './create-advisory.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdvisoryDto extends PartialType(CreateAdvisoryDto) {
  @ApiPropertyOptional({
    example: '2025-06-23T09:00:00',
    description: 'Nueva fecha y hora de la asesoría',
  })
  scheduled_at?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Nuevo ID del profesor asignado',
  })
  teacher_id?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Nuevo ID del estudiante asignado',
  })
  student_id?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Nuevo ID de la materia',
  })
  subject_id?: number;

  @ApiPropertyOptional({
    example: 6,
    description: 'Nuevo ID de la ubicación',
  })
  location_id?: number;
}
