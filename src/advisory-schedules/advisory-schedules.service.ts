import { Injectable } from '@nestjs/common';
import { CreateAdvisoryScheduleDto } from './dto/create-advisory-schedule.dto';
import { UpdateAdvisoryScheduleDto } from './dto/update-advisory-schedule.dto';

@Injectable()
export class AdvisorySchedulesService {
  create(createAdvisoryScheduleDto: CreateAdvisoryScheduleDto) {
    return 'This action adds a new advisorySchedule';
  }

  findAll() {
    return `This action returns all advisorySchedules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} advisorySchedule`;
  }

  update(id: number, updateAdvisoryScheduleDto: UpdateAdvisoryScheduleDto) {
    return `This action updates a #${id} advisorySchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} advisorySchedule`;
  }
}
