import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total de registros' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Registros por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas' })
  total_pages: number;

  @ApiProperty({ description: 'Hay siguiente página' })
  has_next: boolean;

  @ApiProperty({ description: 'Hay página anterior' })
  has_prev: boolean;
}

export class PaginatedAdvisoryDatesResponseDto<T> {
  @ApiProperty({ description: 'Datos de la página actual', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Metadatos de paginación', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
