import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';
import { Advisory } from '../advisories/entities/advisory.entity';
import { AdvisoryDate } from '../advisory-dates/entities/advisory-date.entity';
import { AdvisoryRequest } from '../advisory-requests/entities/advisory-request.entity';
import { AdvisoryAttendance } from '../advisory-attendance/entities/advisory-attendance.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { StudyPlansModule } from '../study-plans/study-plans.module';
import { PlanSubjectsModule } from '../plan-subjects/plan-subjects.module';
import { AcademicService } from '../common/academic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SubjectDetails,
      Advisory,
      AdvisoryDate,
      AdvisoryRequest,
      AdvisoryAttendance,
      Subject,
    ]),
    StudyPlansModule,
    PlanSubjectsModule,
  ],
  providers: [UsersService, AcademicService],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
