import { ApiProperty } from '@nestjs/swagger';

export class VenueDto {
  @ApiProperty({ example: 1 })
  venue_id: number;

  @ApiProperty({ example: 'Aula 2' })
  name: string;

  @ApiProperty({ example: 'classroom' })
  type: string;

  @ApiProperty({
    example: 'https://meet.google.com/abc-defg-hij',
    required: false,
  })
  url?: string;

  @ApiProperty({ example: 'Edificio A', required: false })
  building?: string;

  @ApiProperty({ example: 'Planta Baja', required: false })
  floor?: string;
}
