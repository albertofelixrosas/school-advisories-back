import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvisoriesService } from './advisories.service';
import { AdvisoriesController } from './advisories.controller';
import { Advisory } from './entities/advisory.entity';
import { User } from '../users/entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Venue } from '../venues/entities/venue.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Advisory, Subject, Venue, User]),
    UsersModule,
  ],
  controllers: [AdvisoriesController],
  providers: [AdvisoriesService],
})
export class AdvisoriesModule {}
