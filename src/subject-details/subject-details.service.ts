import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectDetails } from './entities/subject-detail.entity';
import { CreateSubjectDetailDto } from './dto/create-subject-detail.dto';
import { UpdateSubjectDetailDto } from './dto/update-subject-detail.dto';
import { User } from '../users/entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { SubjectSchedule } from '../subject-schedules/entities/subject-schedule.entity';
import { UserRole } from 'src/users/user-role.enum';

@Injectable()
export class SubjectDetailsService {
  constructor(
    @InjectRepository(SubjectDetails)
    private readonly detailsRepo: Repository<SubjectDetails>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
    @InjectRepository(SubjectSchedule)
    private readonly subjectScheduleRepo: Repository<SubjectSchedule>,
  ) {}

  async create(dto: CreateSubjectDetailDto) {
    // Validar subject
    const subject = await this.subjectRepo.findOne({
      where: { subject_id: dto.subject_id },
    });
    if (!subject) {
      throw new NotFoundException(
        `Subject with id ${dto.subject_id} not found`,
      );
    }

    // Validar user (professor)
    const professor = await this.userRepo.findOne({
      where: [{ user_id: dto.professor_id }, { role: UserRole.PROFESSOR }],
    });
    if (!professor) {
      throw new NotFoundException(
        `Professor with id ${dto.professor_id} not found`,
      );
    }

    // Validar horario(s), pero solamente si existen en la petición
    if (dto.schedules === undefined) {
      throw new BadRequestException(
        `Se intentó crear un detalle de materia sin horarios "schedules: ${dto.schedules}"`,
      );
    } else if (dto.schedules.length === 0) {
      throw new BadRequestException(
        `Se intentó crear un detalle de materia sin horarios "schedules: []"`,
      );
    }

    const detail = this.detailsRepo.create({
      ...dto,
      subject,
      professor,
      schedules: dto.schedules,
    });

    return this.detailsRepo.save(detail);
  }

  findAll() {
    return this.detailsRepo.find({ relations: ['subject', 'schedules'] });
  }

  findOne(id: number) {
    return this.detailsRepo.findOne({
      where: { subject_detail_id: id },
      relations: ['subject', 'schedules', 'users'],
    });
  }

  async update(id: number, dto: UpdateSubjectDetailDto) {
    await this.detailsRepo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.detailsRepo.delete(id);
  }
}
