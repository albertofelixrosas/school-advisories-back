import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'nuevo_usuario',
    description: 'Nuevo nombre de usuario a actualizar',
  })
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'clave_segura123',
    description: 'Nueva contraseña del usuario a actualizar',
  })
  @IsString()
  password?: string;
}
