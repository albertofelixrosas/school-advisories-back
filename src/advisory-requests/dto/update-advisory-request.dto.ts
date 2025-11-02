import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAdvisoryRequestDto } from './create-advisory-request.dto';
import { RequestStatus } from '../request-status.enum';

export class UpdateAdvisoryRequestDto extends PartialType(
  CreateAdvisoryRequestDto,
) {
  @ApiPropertyOptional({
    description: 'Estado de la solicitud',
    enum: RequestStatus,
    example: RequestStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({
    description: 'Respuesta del profesor a la solicitud',
    example:
      'Solicitud aprobada. Te veré el lunes a las 10:00 AM en mi oficina.',
  })
  @IsOptional()
  @IsString()
  professor_response?: string;
}
