import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'nuevo_usuario',
    description: 'Nombre de usuario a registrar',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'clave_segura123',
    description: 'Contraseña del usuario',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'student',
    description: 'Rol del usuario (admin, teacher, student)',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
