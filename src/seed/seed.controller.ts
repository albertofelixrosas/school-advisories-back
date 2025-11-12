import { Controller, Post, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('database')
  async seedDatabase() {
    return await this.seedService.seedDatabase();
  }

  @Get('users')
  async getUsersInfo() {
    return await this.seedService.getUsersInfo();
  }
}
