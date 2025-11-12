import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdvisoryAttendanceService } from './advisory-attendance.service';
import { AdvisoryAttendanceController } from './advisory-attendance.controller';

import { AdvisoryAttendance } from './entities/advisory-attendance.entity';
import { User } from '../users/entities/user.entity';
import { AdvisoryDate } from '../advisory-dates/entities/advisory-date.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdvisoryAttendance, User, AdvisoryDate])],
  controllers: [AdvisoryAttendanceController],
  providers: [AdvisoryAttendanceService],
  exports: [AdvisoryAttendanceService], // Opcional: solo si otro módulo necesita usar este servicio
})
export class AdvisoryAttendanceModule {}
