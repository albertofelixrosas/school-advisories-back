import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  async save(token: RefreshToken) {
    return this.repo.save(token);
  }

  async findByToken(token: string) {
    return this.repo.findOne({ where: { token } });
  }

  async deleteById(id: number) {
    return this.repo.delete(id);
  }

  async deleteByUserId(userId: number) {
    return this.repo.delete({ user: { user_id: userId } });
  }
}
