import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Aula B3',
    description:
      'Nombre del lugar fisico (aula o salón) o URL de enlace en linea',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: 'Aula', description: 'Tipo de espacio' })
  @IsNotEmpty()
  @IsString()
  location_type: string;
}
