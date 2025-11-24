import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FrontendListItemDto {
  @ApiProperty({ description: 'ID único del elemento' })
  id: number;

  @ApiProperty({ description: 'Etiqueta principal para mostrar en el frontend' })
  label: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales para el elemento', type: 'object' })
  metadata?: Record<string, any>;
}
