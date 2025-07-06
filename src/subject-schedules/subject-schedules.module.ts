import { Module } from '@nestjs/common';
import { SubjectSchedulesService } from './subject-schedules.service';

@Module({
  controllers: [],
  providers: [SubjectSchedulesService],
})
export class SubjectSchedulesModule {}
