import { Module } from '@nestjs/common';
import { AdvisorySchedulesService } from './advisory-schedules.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvisorySchedule } from './entities/advisory-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdvisorySchedule])],
  providers: [AdvisorySchedulesService],
  exports: [AdvisorySchedulesService],
})
export class AdvisorySchedulesModule {}
