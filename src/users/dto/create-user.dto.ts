import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsInt,
} from 'class-validator';
import { UserRole } from '../user-role.enum';
import { Optional } from '@nestjs/common';

export class CreateUserDto {
  @ApiProperty({
    example: 'juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'pérez',
    description: 'Apellido del usuario',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+526423456789',
    description: 'Número de teléfono del usuario con lada',
  })
  @IsPhoneNumber('MX')
  phone_number: string;

  @ApiProperty({
    example: 'juan123',
    description: 'Nombre de usuario para iniciar sesión',
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
    example: 'https://firebasestorage.googleapis.com/...',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @Optional()
  photo_url: string;

  @ApiProperty({
    example: 2,
    description: 'ID de la escuela a la que pertenece el usuario',
  })
  @IsInt()
  school_id: number;

  @ApiProperty({
    example: 'student',
    description: 'Rol del usuario (admin, professor, student)',
    required: false,
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
