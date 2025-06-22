import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de actualización válido',
  })
  @IsString()
  refresh_token: string;
}
