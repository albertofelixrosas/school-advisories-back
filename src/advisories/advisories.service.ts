import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advisory } from './entities/advisory.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { SubjectDetails } from 'src/subject-details/entities/subject-detail.entity';
import { AdvisorySchedule } from 'src/advisory-schedules/entities/advisory-schedule.entity';
import { UserRole } from 'src/users/user-role.enum';

@Injectable()
export class AdvisoriesService {
  constructor(
    @InjectRepository(Advisory)
    private readonly advisoryRepo: Repository<Advisory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SubjectDetails)
    private readonly subjectDetailRepo: Repository<SubjectDetails>,
    @InjectRepository(AdvisorySchedule)
    private readonly advisoryScheduleRepo: Repository<AdvisorySchedule>,
  ) {}

  async create(dto: CreateAdvisoryDto) {
    const professor = await this.userRepo.findOne({
      where: { user_id: dto.professor_id, role: UserRole.PROFESSOR },
    });
    if (!professor) {
      throw new NotFoundException(`Professor ID ${dto.professor_id} not found`);
    }
    const subjectDetail = await this.subjectDetailRepo.findOne({
      where: { subject_detail_id: dto.subject_detail_id },
    });
    if (!subjectDetail) {
      throw new NotFoundException(
        `Subject Detail ID ${dto.subject_detail_id} not found`,
      );
    }

    const advisory = this.advisoryRepo.create({
      ...dto,
      professor,
      subject_detail: subjectDetail,
    });

    // Validate schedules if provided
    if (!dto.schedules || !Array.isArray(dto.schedules)) {
      throw new NotFoundException(
        `Schedules must be provided as an array in the advisory creation request`,
      );
    }

    const savedAvisory = await this.advisoryRepo.save(advisory);

    const schedules = dto.schedules.map((schedule) => {
      return this.advisoryScheduleRepo.create({
        ...schedule,
        advisory: savedAvisory,
      });
    });

    await this.advisoryScheduleRepo.save(schedules);

    return this.advisoryRepo.save({ ...savedAvisory, schedules });
  }

  async findOne(id: number) {
    return this.advisoryRepo.findOne({
      where: { advisory_id: id },
      relations: ['professor', 'subject_detail', 'schedules'],
    });
  }

  async findAll() {
    return this.advisoryRepo.find({
      relations: ['professor', 'subject_detail', 'schedules'],
    });
  }

  async update(id: number, dto: UpdateAdvisoryDto) {
    const advisory = await this.findOne(id);
    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }

    if (dto.professor_id) {
      const professor = await this.userRepo.findOne({
        where: { user_id: dto.professor_id, role: UserRole.PROFESSOR },
      });
      if (!professor) {
        throw new NotFoundException(
          `Professor with ID ${dto.professor_id} not found`,
        );
      }
      advisory.professor = professor;
    }

    if (dto.subject_detail_id) {
      const subjectDetail = await this.subjectDetailRepo.findOne({
        where: { subject_detail_id: dto.subject_detail_id },
      });
      if (!subjectDetail) {
        throw new NotFoundException(
          `Subject Detail with ID ${dto.subject_detail_id} not found`,
        );
      }
      advisory.subject_detail = subjectDetail;
    }

    if (dto.max_students) {
      advisory.max_students = dto.max_students;
    }

    if (dto.schedules) {
      // Clear existing schedules
      advisory.schedules = [];

      // Remove existing schedules from the database
      await this.advisoryScheduleRepo.remove(advisory.schedules);

      // Add new schedules
      for (const schedule of dto.schedules) {
        const advisorySchedule = this.advisoryScheduleRepo.create(schedule);
        advisorySchedule.advisory = advisory; // Set the relationship
        advisory.schedules.push(advisorySchedule);
      }
    }

    return this.advisoryRepo.save(advisory);
  }

  async remove(id: number) {
    const advisory = await this.findOne(id);
    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }
    return this.advisoryRepo.remove(advisory);
  }
}
