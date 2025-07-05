import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectDetails } from './entities/subject-detail.entity';
import { SubjectSchedule } from '../subject-schedules/entities/subject-schedule.entity';
import { SubjectDetailsService } from './subject-details.service';
import { SubjectDetailsController } from './subject-details.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectDetails, SubjectSchedule])],
  controllers: [SubjectDetailsController],
  providers: [SubjectDetailsService],
})
export class SubjectDetailsModule {}
