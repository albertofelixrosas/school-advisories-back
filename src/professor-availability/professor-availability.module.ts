import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessorAvailabilityService } from './professor-availability.service';
import { ProfessorAvailabilityController } from './professor-availability.controller';
import { ProfessorAvailability } from './entities/professor-availability.entity';
import { User } from '../users/entities/user.entity';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';
import { AdvisoryDate } from '../advisory-dates/entities/advisory-date.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfessorAvailability,
      User,
      SubjectDetails,
      AdvisoryDate,
    ]),
  ],
  controllers: [ProfessorAvailabilityController],
  providers: [ProfessorAvailabilityService],
  exports: [ProfessorAvailabilityService],
})
export class ProfessorAvailabilityModule {}
