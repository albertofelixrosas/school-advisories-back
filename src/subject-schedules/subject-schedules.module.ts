import { Module } from '@nestjs/common';
import { SubjectSchedulesService } from './subject-schedules.service';
import { SubjectSchedulesController } from './subject-schedules.controller';

@Module({
  controllers: [SubjectSchedulesController],
  providers: [SubjectSchedulesService],
})
export class SubjectSchedulesModule {}
