import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanSubject } from './entities/plan-subject.entity';
import { PlanSubjectsService } from './plan-subjects.service';
import { PlanSubjectsController } from './plan-subjects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlanSubject])],
  controllers: [PlanSubjectsController],
  providers: [PlanSubjectsService],
  exports: [TypeOrmModule, PlanSubjectsService],
})
export class PlanSubjectsModule {}
