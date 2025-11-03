import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvisoryRequestService } from './advisory-request.service';
import { AdvisoryRequestController } from './advisory-request.controller';
import { AdvisoryRequest } from './entities/advisory-request.entity';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';
import { User } from '../users/entities/user.entity';
import { NotificationModule } from '../notifications/notification.module';
import { ProfessorAvailabilityModule } from '../professor-availability/professor-availability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdvisoryRequest, SubjectDetails, User]),
    NotificationModule,
    ProfessorAvailabilityModule,
  ],
  controllers: [AdvisoryRequestController],
  providers: [AdvisoryRequestService],
  exports: [AdvisoryRequestService],
})
export class AdvisoryRequestModule {}
