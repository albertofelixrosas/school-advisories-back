import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserPayload } from './interfaces/user-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: UserPayload) {
    const payload = {
      username: user.username,
      sub: user.user_id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '60m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const tokenEntity = this.refreshTokenRepo.create({
      token: refresh_token,
      user: { user_id: user.user_id },
      expires_at: expiresAt,
    });

    await this.refreshTokenRepo.save(tokenEntity);

    return {
      access_token,
      refresh_token,
      username: user.username,
      role: user.role,
    };
  }

  async refreshAccessToken(username: string, refresh_token: string) {
    try {
      // TODO: Aquí hay que consultar, podría dar error esta linea, (verify<{ sub: number }> no tenia antes el generico)
      const decoded = this.jwtService.verify<{ sub: number }>(refresh_token);
      const user = await this.usersService.findByUsername(username);
      if (!user || user.user_id !== decoded.sub)
        throw new UnauthorizedException();

      const storedToken = await this.refreshTokenRepo.findOne({
        where: {
          token: refresh_token,
          user: { user_id: user.user_id },
        },
      });

      if (!storedToken || storedToken.expires_at < new Date()) {
        throw new UnauthorizedException('Token expirado o inválido');
      }

      const newAccessToken = this.jwtService.sign(
        { username: user.username, sub: user.user_id },
        { expiresIn: '45m' },
      );

      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(userId: number) {
    await this.refreshTokenRepo.delete({ user: { user_id: userId } });
  }
}
