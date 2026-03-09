import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Career } from './entities/career.entity';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';
import { User } from '../users/entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { PlanSubject } from '../plan-subjects/entities/plan-subject.entity';
import { StudyPlan } from '../study-plans/entities/study-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Career, User, Subject, PlanSubject, StudyPlan]),
  ],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [TypeOrmModule, CareersService],
})
export class CareersModule {}
