import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { VenueType } from '../venue-type.enum';

export class VenueQueryDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'Aula', description: 'Búsqueda por nombre' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'classroom',
    enum: VenueType,
    description: 'Tipo de lugar',
  })
  @IsOptional()
  @IsEnum(VenueType)
  type?: VenueType;

  @ApiPropertyOptional({ example: 'Edificio A', description: 'Edificio' })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({ example: 'Planta Baja', description: 'Piso' })
  @IsOptional()
  @IsString()
  floor?: string;
}
