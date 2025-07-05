import { Module } from '@nestjs/common';
import { AdvisoryDatesService } from './advisory-dates.service';
import { AdvisoryDatesController } from './advisory-dates.controller';

@Module({
  controllers: [AdvisoryDatesController],
  providers: [AdvisoryDatesService],
})
export class AdvisoryDatesModule {}
