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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Token generado correctamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI...',
        refresh_token: 'eyJhbGciOiJIUzA...',
        username: 'Juan Rulfo',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(@Body() body: LoginDto) {
    // Envolver en un try-catch para manejar errores de validación
    try {
      if (!body.username || !body.password) {
        throw new UnauthorizedException('Credenciales incompletas');
      }
      // Validar el formato del username y password
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
      return this.authService.login(user);
    } catch (error) {
      // Manejar errores específicos de validación
      if (error instanceof UnauthorizedException) {
        // Log the error for debugging purposes
        throw error; // Re-throw the error to be handled by the global exception filter
      }
      // Log cualquier otro error inesperado
      if (error instanceof Error) {
        // Log the error for debugging purposes
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
