import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../user-role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nuevo rol del usuario (admin, teacher, student)',
    required: true,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
