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
import { AdvisoryResponseDto } from './dto/advisory-response.dto';

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

  private generateAdvisoryResponse(advisory: Advisory): AdvisoryResponseDto {
    const result: AdvisoryResponseDto = {
      advisory_id: advisory.advisory_id,
      max_students: advisory.max_students,
      professor: {
        name: advisory.professor.name,
        last_name: advisory.professor.last_name,
        email: advisory.professor.email,
        photo_url: advisory.professor.photo_url,
      },
      subject_detail: {
        subject_detail_id: advisory.subject_detail.subject_detail_id,
        schedules: advisory.subject_detail.schedules.map((s) => ({
          day: s.day,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      },
      schedules: advisory.schedules.map((schedule) => ({
        advisory_schedule_id: schedule.advisory_schedule_id,
        day: schedule.day,
        begin_time: schedule.begin_time,
        end_time: schedule.end_time,
      })),
    };
    return result;
  }

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

    const advisoryWithSchedules = await this.advisoryRepo.save({
      ...savedAvisory,
      schedules,
    });

    return this.generateAdvisoryResponse(advisoryWithSchedules);
  }

  async findOne(id: number): Promise<AdvisoryResponseDto> {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
      relations: ['professor.user', 'subject_detail.schedules', 'schedules'],
    });
    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }

    const result = this.generateAdvisoryResponse(advisory);
    return result;
  }

  async findAll() {
    const advisories = await this.advisoryRepo.find({
      relations: ['professor', 'subject_detail', 'schedules'],
    });
    const results: AdvisoryResponseDto[] = advisories.map((advisory) =>
      this.generateAdvisoryResponse(advisory),
    );

    return results;
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
      // Fetch and remove existing schedules from the database
      const existingSchedules = await this.advisoryScheduleRepo.find({
        where: { advisory: { advisory_id: id } },
      });
      if (existingSchedules.length > 0) {
        await this.advisoryScheduleRepo.remove(existingSchedules);
      }

      // Add new schedules
      advisory.schedules = [];
      for (const schedule of dto.schedules) {
        const advisorySchedule = this.advisoryScheduleRepo.create(schedule);
        advisory.schedules.push(advisorySchedule);
      }
    }

    // Save the updated advisory entity, not the DTO
    return this.advisoryRepo.save({ advisory_id: id, ...dto });
  }

  async remove(id: number) {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
    });
    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }
    return this.advisoryRepo.remove(advisory);
  }
}
