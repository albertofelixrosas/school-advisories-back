import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvisoriesService } from './advisories.service';
import { AdvisoriesController } from './advisories.controller';
import { InvitationService } from './services/invitation.service';
import { Advisory } from './entities/advisory.entity';
import { StudentInvitation } from './entities/student-invitation.entity';
import { User } from '../users/entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';
import { Venue } from '../venues/entities/venue.entity';
import { UsersModule } from 'src/users/users.module';
import { AdvisorySchedule } from '../advisory-schedules/entities/advisory-schedule.entity';
import { AdvisoryDate } from 'src/advisory-dates/entities/advisory-date.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Advisory,
      AdvisoryDate,
      AdvisorySchedule,
      StudentInvitation,
      Subject,
      SubjectDetails,
      Venue,
      User,
    ]),
    UsersModule,
  ],
  controllers: [AdvisoriesController],
  providers: [AdvisoriesService, InvitationService],
  exports: [AdvisoriesService, InvitationService],
})
export class AdvisoriesModule {}
