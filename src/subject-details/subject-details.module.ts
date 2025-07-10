import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectDetails } from './entities/subject-detail.entity';
import { SubjectSchedule } from '../subject-schedules/entities/subject-schedule.entity';
import { SubjectDetailsService } from './subject-details.service';
import { SubjectDetailsController } from './subject-details.controller';
import { Subject } from '../subjects/entities/subject.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubjectDetails, SubjectSchedule, Subject, User]),
  ],
  controllers: [SubjectDetailsController],
  providers: [SubjectDetailsService],
})
export class SubjectDetailsModule {}
