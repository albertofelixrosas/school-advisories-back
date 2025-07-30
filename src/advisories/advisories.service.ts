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
      where: { subject_id: dto.subject_detail_id },
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
    // Validate and set schedules if provided
    if (dto.schedules && Array.isArray(dto.schedules)) {
      advisory.schedules = dto.schedules.map((schedule) => {
        const advisorySchedule = this.advisoryScheduleRepo.create(schedule);
        advisorySchedule.advisory = advisory;
        return advisorySchedule;
      });
    }
    // Save the advisory and its schedules
    await this.advisoryRepo.save(advisory);
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
    await this.advisoryRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const advisory = await this.findOne(id);
    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }
    return this.advisoryRepo.remove(advisory);
  }
}
