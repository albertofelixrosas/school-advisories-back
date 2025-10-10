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
      subject,
      professor,
    });

    const savedDetail = await this.detailsRepo.save(detail);

    // Crear horarios manualmente asignando la relación
    const schedules = dto.schedules.map((s) => {
      return this.subjectScheduleRepo.create({
        ...s,
        subject_details: savedDetail,
      });
    });

    await this.subjectScheduleRepo.save(schedules);

    return this.detailsRepo.save(detail);
  }

  findAll() {
    return this.detailsRepo.find({ relations: ['subject', 'schedules'] });
  }

  findOne(id: number) {
    return this.detailsRepo.findOne({
      where: { subject_detail_id: id },
      relations: ['subject', 'schedules', 'professor'],
    });
  }

  async update(id: number, dto: UpdateSubjectDetailDto) {
    // Primero obtener el detalle existente, incluyendo sus horarios
    const detail = await this.detailsRepo.findOne({
      where: { subject_detail_id: id },
      relations: ['schedules'],
    });

    if (!detail) {
      throw new NotFoundException(`SubjectDetail with id ${id} not found`);
    }

    // Actualizar campos simples
    if (dto.professor_id) {
      const professor = await this.userRepo.findOne({
        where: [{ user_id: dto.professor_id }, { role: UserRole.PROFESSOR }],
      });
      if (!professor) {
        throw new NotFoundException(
          `Professor with id ${dto.professor_id} not found`,
        );
      }
      detail.professor = professor;
    }

    if (dto.subject_id) {
      const subject = await this.subjectRepo.findOne({
        where: { subject_id: dto.subject_id },
      });
      if (!subject) {
        throw new NotFoundException(
          `Subject with id ${dto.subject_id} not found`,
        );
      }
      detail.subject = subject;
    }

    // Si se mandan horarios, reemplazar los anteriores
    if (dto.schedules) {
      detail.schedules = [];

      await this.subjectScheduleRepo.delete({
        subject_details_id: detail.subject_detail_id,
      }); // eliminar los horarios anteriores

      // Crear los nuevos schedules y asignarlos
      detail.schedules = dto.schedules.map((s) =>
        this.subjectScheduleRepo.create({
          ...s,
          subject_details_id: detail.subject_detail_id, // Asegurar que se asigne el ID correcto
        }),
      );
    }

    return this.detailsRepo.save(detail);
  }

  async findByProfessor(professorId: number) {
    // Verificar que el profesor existe
    const professor = await this.userRepo.findOne({
      where: { user_id: professorId, role: UserRole.PROFESSOR },
    });

    if (!professor) {
      throw new NotFoundException(
        `Professor with id ${professorId} not found or is not a professor`,
      );
    }

    // Obtener todas las asignaciones del profesor con relaciones completas
    const subjectDetails = await this.detailsRepo.find({
      where: { professor_id: professorId },
      relations: ['subject', 'schedules', 'advisories', 'professor'],
      order: {
        subject: {
          subject: 'ASC',
        },
      },
    });

    return subjectDetails;
  }

  remove(id: number) {
    return this.detailsRepo.delete(id);
  }
}
