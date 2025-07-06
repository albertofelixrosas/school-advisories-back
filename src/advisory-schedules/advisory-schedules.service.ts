import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvisorySchedule } from './entities/advisory-schedule.entity';
import { CreateAdvisoryScheduleDto } from './dto/create-advisory-schedule.dto';

@Injectable()
export class AdvisorySchedulesService {
  constructor(
    @InjectRepository(AdvisorySchedule)
    private readonly schedulesRepo: Repository<AdvisorySchedule>,
  ) {}

  async create(advisoryId: number, dto: CreateAdvisoryScheduleDto) {
    const schedule = this.schedulesRepo.create({
      ...dto,
      advisory_id: advisoryId,
    });
    return this.schedulesRepo.save(schedule);
  }

  findAllByAdvisory(advisoryId: number) {
    return this.schedulesRepo.find({ where: { advisory_id: advisoryId } });
  }

  async remove(id: number) {
    return this.schedulesRepo.delete(id);
  }
}
