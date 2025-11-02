import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveRequestDto {
  @ApiProperty({
    description: 'Respuesta del profesor aprobando la solicitud',
    example:
      'Solicitud aprobada. Te veré el lunes a las 10:00 AM en mi oficina.',
  })
  @IsNotEmpty()
  @IsString()
  professor_response: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora propuesta para la asesoría (ISO string)',
    example: '2025-11-04T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  proposed_date?: string;
}

export class RejectRequestDto {
  @ApiProperty({
    description: 'Razón del rechazo de la solicitud',
    example:
      'Lo siento, no tengo disponibilidad en las fechas solicitadas. Intenta con otra materia.',
  })
  @IsNotEmpty()
  @IsString()
  professor_response: string;
}
