import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdvisoryDatesService } from './advisory-dates.service';
import { AdvisoryDatesController } from './advisory-dates.controller';

import { AdvisoryDate } from './entities/advisory-date.entity';
import { Venue } from '../venues/entities/venue.entity';
import { AdvisoryAttendance } from '../advisory-attendance/entities/advisory-attendance.entity';
import { User } from '../users/entities/user.entity';
import { Advisory } from '../advisories/entities/advisory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdvisoryDate,
      Venue,
      AdvisoryAttendance,
      User,
      Advisory,
    ]),
  ],
  controllers: [AdvisoryDatesController],
  providers: [AdvisoryDatesService],
  exports: [AdvisoryDatesService], // opcional, si otros módulos lo requieren
})
export class AdvisoryDatesModule {}
