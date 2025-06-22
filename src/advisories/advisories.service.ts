import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advisory } from './entities/advisory.entity';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Location } from '../locations/entities/location.entity';

@Injectable()
export class AdvisoriesService {
  constructor(
    @InjectRepository(Advisory)
    private readonly advisoryRepo: Repository<Advisory>,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  async create(dto: CreateAdvisoryDto) {
    const advisory = new Advisory();
    advisory.scheduled_at = new Date(dto.scheduled_at);

    const teacher = await this.teacherRepo.findOneBy({
      teacher_id: dto.teacher_id,
    });
    if (!teacher)
      throw new NotFoundException(
        `Teacher with ID ${dto.teacher_id} not found`,
      );
    advisory.teacher = teacher;

    const student = await this.studentRepo.findOneBy({
      student_id: dto.student_id,
    });
    if (!student)
      throw new NotFoundException(
        `Student with ID ${dto.student_id} not found`,
      );
    advisory.student = student;

    const subject = await this.subjectRepo.findOneBy({
      subject_id: dto.subject_id,
    });
    if (!subject)
      throw new NotFoundException(
        `Subject with ID ${dto.subject_id} not found`,
      );
    advisory.subject = subject;

    const location = await this.locationRepo.findOneBy({
      location_id: dto.location_id,
    });
    if (!location)
      throw new NotFoundException(
        `Location with ID ${dto.location_id} not found`,
      );
    advisory.location = location;

    return this.advisoryRepo.save(advisory);
  }

  findAll() {
    return this.advisoryRepo.find();
  }

  findOne(id: number) {
    return this.advisoryRepo.findOneBy({ advisory_id: id });
  }

  async update(id: number, dto: UpdateAdvisoryDto) {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
    });

    if (!advisory) {
      throw new NotFoundException(`Advisory with ID ${id} not found`);
    }

    if (dto.scheduled_at) {
      advisory.scheduled_at = new Date(dto.scheduled_at);
    }

    if (dto.teacher_id !== undefined) {
      const teacher = await this.teacherRepo.findOneBy({
        teacher_id: dto.teacher_id,
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with ID ${dto.teacher_id} not found`,
        );
      }
      advisory.teacher = teacher;
    }

    if (dto.student_id !== undefined) {
      const student = await this.studentRepo.findOneBy({
        student_id: dto.student_id,
      });
      if (!student) {
        throw new NotFoundException(
          `Student with ID ${dto.student_id} not found`,
        );
      }
      advisory.student = student;
    }

    if (dto.subject_id !== undefined) {
      const subject = await this.subjectRepo.findOneBy({
        subject_id: dto.subject_id,
      });
      if (!subject) {
        throw new NotFoundException(
          `Subject with ID ${dto.subject_id} not found`,
        );
      }
      advisory.subject = subject;
    }

    if (dto.location_id !== undefined) {
      const location = await this.locationRepo.findOneBy({
        location_id: dto.location_id,
      });
      if (!location) {
        throw new NotFoundException(
          `Location with ID ${dto.location_id} not found`,
        );
      }
      advisory.location = location;
    }

    return this.advisoryRepo.save(advisory);
  }

  remove(id: number) {
    return this.advisoryRepo.delete(id);
  }
}
