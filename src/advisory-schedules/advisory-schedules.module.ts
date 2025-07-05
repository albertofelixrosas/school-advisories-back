import { Module } from '@nestjs/common';
import { AdvisorySchedulesService } from './advisory-schedules.service';
import { AdvisorySchedulesController } from './advisory-schedules.controller';

@Module({
  controllers: [AdvisorySchedulesController],
  providers: [AdvisorySchedulesService],
})
export class AdvisorySchedulesModule {}
