import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdvisoryRequestDto {
  @ApiProperty({
    description:
      'ID de la materia específica para la cual se solicita asesoría',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  subject_detail_id: number;

  @ApiPropertyOptional({
    description:
      'Mensaje opcional del estudiante explicando su necesidad de asesoría',
    example:
      'Necesito ayuda con los ejercicios de cálculo diferencial, específicamente con límites.',
  })
  @IsOptional()
  @IsString()
  student_message?: string;
}
