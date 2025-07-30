import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubjectSchedulesService } from './subject-schedules.service';
import { SubjectSchedule } from './entities/subject-schedule.entity';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectSchedule, SubjectDetails])],
  // controllers: [SubjectSchedulesController],
  providers: [SubjectSchedulesService],
  exports: [SubjectSchedulesService], // útil si será usado por otros módulos
})
export class SubjectSchedulesModule {}
