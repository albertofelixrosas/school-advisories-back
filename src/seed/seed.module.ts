import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Career } from '../careers/entities/career.entity';
import { StudyPlan } from '../study-plans/entities/study-plan.entity';
import { PlanSubject } from '../plan-subjects/entities/plan-subject.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Career,
      StudyPlan,
      PlanSubject,
      Subject,
      SubjectDetails,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
