import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectScheduleDto } from './dto/create-subject-schedule.dto';
import { UpdateSubjectScheduleDto } from './dto/update-subject-schedule.dto';
import { SubjectSchedule } from './entities/subject-schedule.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SubjectSchedulesService {
  constructor(
    @InjectRepository(SubjectSchedule)
    private readonly subjectSchedulesRepo: Repository<SubjectSchedule>,
  ) {}

  async create(dto: CreateSubjectScheduleDto) {
    // Create a new SubjectSchedule entity from the DTO
    const subjectSchedule = this.subjectSchedulesRepo.create(dto);
    return this.subjectSchedulesRepo.save(subjectSchedule);
  }

  findAll() {
    // Return all subject schedules
    return this.subjectSchedulesRepo.find();
  }

  async findOne(id: number) {
    // Check if not exists
    const subjectSchedule = await this.subjectSchedulesRepo.findOne({
      where: { subject_schedule_id: id },
      relations: ['subject_details'], // Include related subject details
    });
    if (!subjectSchedule) {
      throw new NotFoundException(`SubjectSchedule with ID ${id} not found`);
    }
    // Return the found subject schedule
    return subjectSchedule;
  }

  async update(id: number, dto: UpdateSubjectScheduleDto) {
    // Update a subject schedule by its ID
    const subjectSchedule = await this.findOne(id);
    if (!subjectSchedule) {
      throw new NotFoundException(`SubjectSchedule with ID ${id} not found`);
    }
    // Update the properties of the found subject schedule
    Object.assign(subjectSchedule, dto);
    // Save the updated subject schedule
    return this.subjectSchedulesRepo.save(subjectSchedule);
  }

  async remove(id: number) {
    // Remove a subject schedule by its ID
    const result = await this.subjectSchedulesRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SubjectSchedule with ID ${id} not found`);
    }
    // Return the result of the deletion
    return { message: `SubjectSchedule with ID ${id} deleted successfully` };
  }
}
