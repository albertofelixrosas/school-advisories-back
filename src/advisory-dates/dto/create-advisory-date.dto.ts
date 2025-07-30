import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString } from 'class-validator';

export class CreateAdvisoryDateDto {
  @ApiProperty({ example: 1, description: 'ID de la asesoría' })
  @IsInt()
  advisory_id: number;

  @ApiProperty({
    example: 2,
    description: 'ID del lugar donde se realizará la asesoría',
  })
  @IsInt()
  venue_id: number;

  @ApiProperty({
    example: 'Repaso de funciones trigonométricas',
    description: 'Tema de la asesoría',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    example: '2025-08-15T10:00:00.000Z',
    description: 'Fecha y hora en formato ISO 8601',
  })
  @IsDateString()
  date: string;
}
