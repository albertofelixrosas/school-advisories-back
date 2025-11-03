import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '../entities/student-invitation.entity';

export class InviteStudentsDto {
  @ApiProperty({
    type: [Number],
    description: 'IDs de los estudiantes a invitar',
    example: [1, 2, 3],
  })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  student_ids: number[];

  @ApiProperty({
    example:
      'Te invito a participar en esta asesoría de Cálculo Diferencial sobre límites.',
    description: 'Mensaje personalizado de invitación (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  invitation_message?: string;

  @ApiProperty({
    example: '2025-11-10T10:00:00.000Z',
    description:
      'Fecha de expiración de la invitación (opcional, por defecto 24h)',
    required: false,
  })
  @IsOptional()
  expires_at?: Date;
}

export class RespondInvitationDto {
  @ApiProperty({
    enum: InvitationStatus,
    description: 'Respuesta a la invitación',
    example: InvitationStatus.ACCEPTED,
  })
  @IsNotEmpty()
  @IsEnum(InvitationStatus)
  status: InvitationStatus.ACCEPTED | InvitationStatus.DECLINED;

  @ApiProperty({
    example: 'Gracias por la invitación, estaré presente.',
    description: 'Mensaje de respuesta del estudiante (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  response_message?: string;
}

export class InvitationResponseDto {
  @ApiProperty({ example: 1 })
  invitation_id: number;

  @ApiProperty({ example: 1 })
  advisory_date_id: number;

  @ApiProperty({ example: 1 })
  student_id: number;

  @ApiProperty({ example: 'PENDING' })
  status: InvitationStatus;

  @ApiProperty({ example: 'Te invito a participar...' })
  invitation_message: string;

  @ApiProperty({ example: '2025-11-05T10:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2025-11-06T10:00:00.000Z' })
  expires_at: Date;

  student?: {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
  };

  advisory_date?: {
    advisory_date_id: number;
    topic: string;
    date: string;
    venue_id: number;
  };
}
