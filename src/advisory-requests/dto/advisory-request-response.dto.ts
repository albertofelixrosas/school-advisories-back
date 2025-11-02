import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../request-status.enum';

export class AdvisoryRequestResponseDto {
  @ApiProperty({
    description: 'ID único de la solicitud',
    example: 1,
  })
  request_id: number;

  @ApiProperty({
    description: 'ID del estudiante que hizo la solicitud',
    example: 5,
  })
  student_id: number;

  @ApiProperty({
    description: 'ID del profesor al que se dirige la solicitud',
    example: 2,
  })
  professor_id: number;

  @ApiProperty({
    description: 'ID de la materia específica',
    example: 1,
  })
  subject_detail_id: number;

  @ApiProperty({
    description: 'Estado actual de la solicitud',
    enum: RequestStatus,
    example: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ApiProperty({
    description: 'Mensaje del estudiante',
    example: 'Necesito ayuda con cálculo diferencial',
    nullable: true,
  })
  student_message: string | null;

  @ApiProperty({
    description: 'Respuesta del profesor',
    example: 'Solicitud aprobada para el lunes',
    nullable: true,
  })
  professor_response: string | null;

  @ApiProperty({
    description: 'Fecha cuando fue procesada la solicitud',
    example: '2025-11-01T15:30:00Z',
    nullable: true,
  })
  processed_at: Date | null;

  @ApiProperty({
    description: 'ID del usuario que procesó la solicitud',
    example: 2,
    nullable: true,
  })
  processed_by_id: number | null;

  @ApiProperty({
    description: 'Fecha de creación de la solicitud',
    example: '2025-11-01T10:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-11-01T15:30:00Z',
  })
  updated_at: Date;

  // Relaciones opcionales que se pueden incluir
  student?: {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
    student_id: string;
  };

  professor?: {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
    employee_id: string;
  };

  subject_detail?: {
    subject_detail_id: number;
    subject: {
      subject_id: number;
      subject: string;
    };
  };
}
