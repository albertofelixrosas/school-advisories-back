import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly repo: Repository<Subject>,
    @InjectRepository(SubjectDetails)
    private readonly subjectDetailsRepo: Repository<SubjectDetails>,
  ) {}

  async create(dto: CreateSubjectDto): Promise<Subject> {
    // Verificar unicidad del nombre de materia
    const existingSubject = await this.repo.findOne({
      where: { subject: dto.subject },
    });

    if (existingSubject) {
      throw new ConflictException(
        `Subject with name "${dto.subject}" already exists`,
      );
    }

    const subject = this.repo.create(dto);
    return this.repo.save(subject);
  }

  findAll(): Promise<Subject[]> {
    return this.repo.find({
      order: { subject: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.repo.findOne({
      where: { subject_id: id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto): Promise<Subject> {
    await this.findOne(id); // Verifica que existe

    // Si se actualiza el nombre, verificar unicidad
    if (dto.subject) {
      const existingSubject = await this.repo.findOne({
        where: { subject: dto.subject },
      });

      if (existingSubject && existingSubject.subject_id !== id) {
        throw new ConflictException(
          `Subject with name "${dto.subject}" already exists`,
        );
      }
    }

    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id); // Verifica que existe

    // Verificar que no tenga asignaciones activas
    const activeAssignments = await this.subjectDetailsRepo.count({
      where: { subject_id: id },
    });

    if (activeAssignments > 0) {
      throw new BadRequestException(
        `Cannot delete subject "${subject.subject}" because it has ${activeAssignments} active assignments`,
      );
    }

    await this.repo.delete(id);
  }

  /**
   * Obtiene materias con estadísticas de asignaciones
   */
  async findAllWithStats(): Promise<
    Array<Subject & { assignments_count: number; professors_count: number }>
  > {
    const subjects = await this.repo
      .createQueryBuilder('subject')
      .leftJoin('subject.subject_details', 'details')
      .leftJoin('details.professor', 'professor')
      .select([
        'subject.subject_id',
        'subject.subject',
        'subject.created_at',
        'subject.updated_at',
      ])
      .addSelect(
        'COUNT(DISTINCT details.subject_detail_id)',
        'assignments_count',
      )
      .addSelect('COUNT(DISTINCT details.professor_id)', 'professors_count')
      .groupBy('subject.subject_id')
      .orderBy('subject.subject', 'ASC')
      .getRawAndEntities();

    return subjects.entities.map((subject, index) => ({
      ...subject,
      assignments_count: parseInt(subjects.raw[index].assignments_count) || 0,
      professors_count: parseInt(subjects.raw[index].professors_count) || 0,
    }));
  }
}
