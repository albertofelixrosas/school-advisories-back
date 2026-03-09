import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Career } from './entities/career.entity';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Career])],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [TypeOrmModule, CareersService],
})
export class CareersModule {}
