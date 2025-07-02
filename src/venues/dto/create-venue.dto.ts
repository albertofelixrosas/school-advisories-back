import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VenueType } from '../venue-type.enum';

export class CreateVenueDto {
  @ApiProperty({ example: 'Aula 2', description: 'Nombre del lugar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'classroom',
    enum: VenueType,
    description: 'Tipo de lugar (classroom, office, virtual)',
  })
  @IsEnum(VenueType)
  type: VenueType;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 'Edificio A' })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({ example: 'Planta Baja' })
  @IsOptional()
  @IsString()
  floor?: string;
}
