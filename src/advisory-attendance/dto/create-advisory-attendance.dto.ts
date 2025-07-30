import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdvisoryAttendanceDto {
  @ApiProperty({
    example: 1,
    description: 'ID del estudiante que asistirá a la asesoría',
  })
  @IsInt()
  student_id: number;

  @ApiProperty({
    example: 3,
    description: 'ID de la fecha de asesoría (AdvisoryDate)',
  })
  @IsInt()
  advisory_date_id: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si el estudiante asistió o no (por defecto: false)',
  })
  @IsOptional()
  @IsBoolean()
  attended?: boolean = false;
}
