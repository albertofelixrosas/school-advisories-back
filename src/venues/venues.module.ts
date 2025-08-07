import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { Venue } from './entities/venue.entity';
import { AdvisoryDate } from 'src/advisory-dates/entities/advisory-date.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue, AdvisoryDate])],
  controllers: [VenuesController],
  providers: [VenuesService],
})
export class VenuesModule {}
