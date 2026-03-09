import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from './entities/study-plan.entity';
import { StudyPlansService } from './study-plans.service';
import { StudyPlansController } from './study-plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlan])],
  controllers: [StudyPlansController],
  providers: [StudyPlansService],
  exports: [TypeOrmModule, StudyPlansService],
})
export class StudyPlansModule {}
