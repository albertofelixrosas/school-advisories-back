import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from './entities/subject.entity';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, SubjectDetails])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
