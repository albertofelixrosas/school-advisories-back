import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  @IsString()
  username: string;

  @ApiProperty({ example: '123456', description: 'Contraseña del usuario' })
  @IsString()
  password: string;
}
