import { Module } from '@nestjs/common';
import { StudentInvitationsController } from './student-invitations.controller';
import { AdvisoriesModule } from '../advisories/advisories.module';

@Module({
  imports: [AdvisoriesModule],
  controllers: [StudentInvitationsController],
})
export class StudentInvitationsModule {}
