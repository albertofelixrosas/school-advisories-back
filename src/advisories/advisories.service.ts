import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advisory } from './entities/advisory.entity';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { Subject } from '../subjects/entities/subject.entity';
import { Venue } from '../venues/entities/venue.entity';

import { In } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/user-role.enum';

@Injectable()
export class AdvisoriesService {
  constructor(
    @InjectRepository(Advisory)
    private readonly advisoryRepo: Repository<Advisory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
  ) {}

  async create(dto: CreateAdvisoryDto) {
    const advisory = new Advisory();
    advisory.date = dto.date;
    advisory.begin_time = dto.begin_time;
    advisory.end_time = dto.end_time;
    advisory.description = dto.description ?? '';

    const [teacher, subject, venue] = await Promise.all([
      this.userRepo.findOneBy({
        user_id: dto.teacher_id,
        role: UserRole.TEACHER,
      }),
      this.subjectRepo.findOneBy({ subject_id: dto.subject_id }),
      this.venueRepo.findOneBy({ venue_id: dto.venue_id }),
    ]);

    if (!teacher)
      throw new NotFoundException(`Teacher ID ${dto.teacher_id} not found`);
    if (!subject)
      throw new NotFoundException(`Subject ID ${dto.subject_id} not found`);
    if (!venue)
      throw new NotFoundException(`Venue ID ${dto.venue_id} not found`);

    // Validar conflictos
    const existing = await this.advisoryRepo.find({
      where: [
        { teacher: { user_id: dto.teacher_id }, date: dto.date },
        { venue: { venue_id: dto.venue_id }, date: dto.date },
      ],
      relations: ['students', 'teacher', 'venues'],
    });

    const studentIds = new Set(dto.students);
    for (const advisory of existing) {
      const overlaps =
        advisory.begin_time < dto.end_time &&
        advisory.end_time > dto.begin_time;

      if (overlaps) {
        if (advisory.teacher.user_id === dto.teacher_id) {
          throw new NotFoundException(
            `Teacher ID ${dto.teacher_id} has a conflict`,
          );
        }
        if (advisory.venue.venue_id === dto.venue_id) {
          throw new NotFoundException(
            `Venue ID ${dto.venue_id} has a conflict`,
          );
        }
        for (const s of advisory.students) {
          if (studentIds.has(s.user_id)) {
            throw new NotFoundException(
              `Student ID ${s.user_id} has a conflict`,
            );
          }
        }
      }
    }

    // Obtener estudiantes
    if (
      !dto.students ||
      !Array.isArray(dto.students) ||
      dto.students.length === 0
    ) {
      throw new NotFoundException(`Students list cannot be empty`);
    }

    const students = await this.userRepo.find({
      where: {
        user_id: In(dto.students),
        role: UserRole.STUDENT,
      },
    });

    if (students.length !== dto.students.length) {
      throw new NotFoundException(`Some student IDs were not found`);
    }

    advisory.teacher = teacher;
    advisory.subject = subject;
    advisory.venue = venue;
    advisory.students = students;

    return this.advisoryRepo.save(advisory);
  }

  findAll() {
    return this.advisoryRepo.find({
      relations: ['teacher', 'subject', 'venue', 'students'],
    });
  }

  async findOne(id: number) {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
      relations: ['teacher', 'subject', 'venue', 'students'],
    });

    if (!advisory) throw new NotFoundException(`Advisory ID ${id} not found`);
    return advisory;
  }

  async update(id: number, dto: UpdateAdvisoryDto) {
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: id },
      relations: ['students', 'teacher', 'subject', 'venue'],
    });

    if (!advisory) {
      throw new NotFoundException(`Advisory ID ${id} not found`);
    }

    // ✅ Actualizar datos básicos
    advisory.date = dto.date ?? advisory.date;
    advisory.begin_time = dto.begin_time ?? advisory.begin_time;
    advisory.end_time = dto.end_time ?? advisory.end_time;
    advisory.description = dto.description ?? advisory.description;

    // ✅ Validar y actualizar teacher
    if (dto.teacher_id !== undefined) {
      const teacher = await this.userRepo.findOneBy({
        user_id: dto.teacher_id,
        role: UserRole.TEACHER,
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher ID ${dto.teacher_id} not found`);
      }

      advisory.teacher = teacher;
    }

    // ✅ Validar y actualizar subject
    if (dto.subject_id !== undefined) {
      const subject = await this.subjectRepo.findOneBy({
        subject_id: dto.subject_id,
      });

      if (!subject) {
        throw new NotFoundException(`Subject ID ${dto.subject_id} not found`);
      }

      advisory.subject = subject;
    }

    // ✅ Validar y actualizar location
    if (dto.venue_id !== undefined) {
      const venue = await this.venueRepo.findOneBy({
        venue_id: dto.venue_id,
      });

      if (!venue) {
        throw new NotFoundException(`Venue ID ${dto.venue_id} not found`);
      }

      advisory.venue = venue;
    }

    // ✅ Validar y actualizar lista de estudiantes
    if (dto.students !== undefined) {
      if (!Array.isArray(dto.students) || dto.students.length === 0) {
        throw new NotFoundException(`Students list cannot be empty`);
      }

      const students = await this.userRepo.find({
        where: {
          user_id: In(dto.students),
          role: UserRole.STUDENT,
        },
      });

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
