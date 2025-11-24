import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SessionStatus {
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  ALL = 'all',
}

export class FindAdvisoryDatesQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de asesoría específica',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  advisory_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de profesor',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  professor_id?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO 8601) - sesiones desde esta fecha',
    example: '2024-11-01',
  })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin (ISO 8601) - sesiones hasta esta fecha',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({
    description: 'Estado de las sesiones',
    enum: SessionStatus,
    default: SessionStatus.ALL,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus = SessionStatus.ALL;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Registros por página',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
