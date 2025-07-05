import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  Param,
  Put,
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
    try {
      return this.usersService.create(body);
    } catch (error) {
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al crear el usuario:', error.message);
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          error instanceof Error ? error.message : 'Error al crear el usuario',
        error: 'Bad Request',
      };
    }
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

  @Get('professors')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los profesores' })
  @ApiOkResponse({ description: 'Lista de usuarios con rol profesor' })
  findAllProfessors() {
    return this.usersService.findByRole(UserRole.PROFESSOR);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar rol del usuario' })
  updateRole(@Param('id') id: number, @Body() dto: UpdateUserRoleDto) {
    try {
      return this.usersService.updateRole(id, dto.role);
    } catch (error) {
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al actualizar el rol del usuario:', error.message);
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          error instanceof Error ? error.message : 'Error al actualizar el rol',
        error: 'Bad Request',
      };
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar información del usuario' })
  @ApiOkResponse({ description: 'Usuario actualizado correctamente' })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o usuario no encontrado',
  })
  update(@Param('id') id: number, @Body() body: Partial<CreateUserDto>) {
    try {
      return this.usersService.update(id, body);
    } catch (error) {
      if (error instanceof Error) {
        // Log the error for debugging purposes
        console.error('Error al actualizar el usuario:', error.message);
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          error instanceof Error
            ? error.message
            : 'Error al actualizar el usuario',
        error: 'Bad Request',
      };
    }
  }
}
