import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';
import { UserRole } from '../user-role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'Juan Carlos',
    description: 'Nombre del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Pérez García',
    description: 'Apellido del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    example: 'juan.carlos.perez@example.com',
    description: 'Correo electrónico del usuario',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+526441234567',
    description: 'Número de teléfono del usuario con lada',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('MX')
  phone_number?: string;

  @ApiProperty({
    example: 'juancarlos2024',
    description: 'Nombre de usuario para iniciar sesión',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'nueva_clave_segura456',
    description: 'Nueva contraseña del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example:
      'https://firebasestorage.googleapis.com/v0/b/project/o/users%2Fjuan.jpg',
    description: 'URL de la foto de perfil del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty({
    example: 3,
    description: 'ID de la escuela a la que pertenece el usuario',
    required: false,
  })
  @IsOptional()
  @IsInt()
  school_id?: number;

  @ApiProperty({
    example: UserRole.PROFESSOR,
    description: 'Rol del usuario (admin, professor, student)',
    required: false,
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
