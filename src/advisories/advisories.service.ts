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
    advisory.date = dto.date;
    advisory.begin_time = dto.begin_time;
    advisory.end_time = dto.end_time;

    const [teacher, subject, location] = await Promise.all([
      this.teacherRepo.findOneBy({ teacher_id: dto.teacher_id }),
      this.subjectRepo.findOneBy({ subject_id: dto.subject_id }),
      this.locationRepo.findOneBy({ location_id: dto.location_id }),
    ]);

    if (!teacher)
      throw new NotFoundException(`Teacher ID ${dto.teacher_id} not found`);
    if (!subject)
      throw new NotFoundException(`Subject ID ${dto.subject_id} not found`);
    if (!location)
      throw new NotFoundException(`Location ID ${dto.location_id} not found`);

    advisory.teacher = teacher;
    advisory.subject = subject;
    advisory.location = location;

    // Obtener estudiantes desde sus IDs
    const students = await this.studentRepo.findByIds(dto.students);
    if (students.length !== dto.students.length) {
      throw new NotFoundException(`Some student IDs were not found`);
    }
    advisory.students = students;

    return this.advisoryRepo.save(advisory);
  }

  findAll() {
    return this.advisoryRepo.find({
      relations: ['teacher', 'subject', 'location', 'students'],
    });
  }

  async findOne(id: number) {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
      relations: ['teacher', 'subject', 'location', 'students'],
    });

    if (!advisory) throw new NotFoundException(`Advisory ID ${id} not found`);
    return advisory;
  }

  async update(id: number, dto: UpdateAdvisoryDto) {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
      relations: ['students'],
    });
    if (!advisory) throw new NotFoundException(`Advisory ID ${id} not found`);

    advisory.date = dto.date ?? advisory.date;
    advisory.begin_time = dto.begin_time ?? advisory.begin_time;
    advisory.end_time = dto.end_time ?? advisory.end_time;

    if (dto.teacher_id !== undefined) {
      const teacher = await this.teacherRepo.findOneBy({
        teacher_id: dto.teacher_id,
      });
      if (!teacher)
        throw new NotFoundException(`Teacher ID ${dto.teacher_id} not found`);
      advisory.teacher = teacher;
    }

    if (dto.subject_id !== undefined) {
      const subject = await this.subjectRepo.findOneBy({
        subject_id: dto.subject_id,
      });
      if (!subject)
        throw new NotFoundException(`Subject ID ${dto.subject_id} not found`);
      advisory.subject = subject;
    }

    if (dto.location_id !== undefined) {
      const location = await this.locationRepo.findOneBy({
        location_id: dto.location_id,
      });
      if (!location)
        throw new NotFoundException(`Location ID ${dto.location_id} not found`);
      advisory.location = location;
    }

    if (dto.students !== undefined) {
      const students = await this.studentRepo.findByIds(dto.students);
      if (students.length !== dto.students.length) {
        throw new NotFoundException(`Some student IDs were not found`);
      }
      advisory.students = students;
    }

    return this.advisoryRepo.save(advisory);
  }

  async remove(id: number) {
    const advisory = await this.advisoryRepo.findOneBy({ advisory_id: id });
    if (!advisory) throw new NotFoundException(`Advisory ID ${id} not found`);
    return this.advisoryRepo.delete(id);
  }
}
