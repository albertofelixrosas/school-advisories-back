import { Injectable } from '@nestjs/common';
import { CreateSubjectScheduleDto } from './dto/create-subject-schedule.dto';
import { UpdateSubjectScheduleDto } from './dto/update-subject-schedule.dto';

@Injectable()
export class SubjectSchedulesService {
  create(createSubjectScheduleDto: CreateSubjectScheduleDto) {
    return 'This action adds a new subjectSchedule';
  }

  findAll() {
    return `This action returns all subjectSchedules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subjectSchedule`;
  }

  update(id: number, updateSubjectScheduleDto: UpdateSubjectScheduleDto) {
    return `This action updates a #${id} subjectSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} subjectSchedule`;
  }
}
