import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from './types/request-with-user';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión y obtener token JWT con datos del dashboard',
    description:
      'Autentica al usuario y retorna tokens JWT junto con información personalizada del dashboard según su rol (profesor, estudiante o admin)',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login exitoso con datos del dashboard incluidos',
    type: LoginResponseDto,
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        username: 'jdoe2024',
        user: {
          user_id: 1,
          username: 'jdoe2024',
          name: 'Juan',
          last_name: 'Doe',
          email: 'juan.doe@university.edu',
          phone_number: '+526441234567',
          role: 'professor',
          photo_url: 'https://example.com/photo.jpg',
          school_id: 1,
          employee_id: 'PR2024001',
        },
        dashboard_data: {
          professor_stats: {
            active_advisories_count: 5,
            total_students_enrolled: 25,
            upcoming_sessions_count: 3,
            completed_sessions_count: 12,
          },
          assigned_subjects: [],
          active_advisories: [],
          upcoming_advisory_dates: [],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    try {
      if (!body.username || !body.password) {
        throw new UnauthorizedException('Credenciales incompletas');
      }

      if (
        typeof body.username !== 'string' ||
        typeof body.password !== 'string'
      ) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const user = await this.authService.validateUser(
        body.username,
        body.password,
      );

      return await this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof Error) {
        console.error('Error al iniciar sesión:', error.message);
      }

      throw new UnauthorizedException('Error al iniciar sesión');
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acceso usando refresh_token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'Nuevo token generado correctamente',
    schema: {
      example: {
        access_token: 'nuevo.jwt.token',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido o faltante' })
  refresh(@Body() body: RefreshTokenDto) {
    if (!body.username || !body.refresh_token) {
      throw new UnauthorizedException('Datos incompletos');
    }
    return this.authService.refreshAccessToken(
      body.username,
      body.refresh_token,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Cerrar sesión y revocar refresh_token',
    description:
      'Este endpoint cierra la sesión del usuario autenticado. Se requiere un token JWT válido en el encabezado Authorization.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Sesión cerrada correctamente',
    schema: {
      example: {
        message: 'Sesión cerrada',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido o faltante',
  })
  logout(@Req() req: RequestWithUser) {
    return this.authService.logout(req.user.user_id);
  }
}
