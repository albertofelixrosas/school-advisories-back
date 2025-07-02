import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from './user-role.enum';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'Usuario creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o ya registrados' })
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiOkResponse({ description: 'Lista de usuarios' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('students')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los estudiantes' })
  @ApiOkResponse({ description: 'Lista de usuarios con rol estudiante' })
  findAllStudents() {
    return this.usersService.findByRole(UserRole.STUDENT);
  }

  @Get('teachers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los profesores' })
  @ApiOkResponse({ description: 'Lista de usuarios con rol profesor' })
  findAllTeachers() {
    return this.usersService.findByRole(UserRole.TEACHER);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar rol del usuario' })
  updateRole(@Param('id') id: number, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }
}
