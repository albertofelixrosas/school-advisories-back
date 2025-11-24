import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export enum AdvisorySortBy {
  DATE = 'date',
  SUBJECT = 'subject',
  PROFESSOR = 'professor',
  STUDENTS = 'students',
}

export enum AdvisoryOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SearchAdvisoriesQueryDto {
  @ApiPropertyOptional({ description: 'Texto libre para buscar por materia, profesor o tema' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'ID de materia para filtrar' })
  @IsOptional()
  @IsNumber()
  subject_id?: number;

  @ApiPropertyOptional({ description: 'ID de profesor para filtrar' })
  @IsOptional()
  @IsNumber()
  professor_id?: number;

  @ApiPropertyOptional({ description: 'Campo por el que ordenar', enum: AdvisorySortBy })
  @IsOptional()
  @IsEnum(AdvisorySortBy)
  sort_by?: AdvisorySortBy;

  @ApiPropertyOptional({ description: 'Orden ASC/DESC', enum: AdvisoryOrder })
  @IsOptional()
  @IsEnum(AdvisoryOrder)
  order?: AdvisoryOrder;
}
