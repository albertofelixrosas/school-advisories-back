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
import { UserRole } from '../users/user-role.enum';

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
      where: { user_id: dto.professor_id, role: UserRole.PROFESSOR },
    });
    if (!professor) {
      throw new NotFoundException(
        `Professor with id ${dto.professor_id} not found or is not a professor`,
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
        where: { user_id: dto.professor_id, role: UserRole.PROFESSOR },
      });
      if (!professor) {
        throw new NotFoundException(
          `Professor with id ${dto.professor_id} not found or is not a professor`,
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

  async remove(id: number): Promise<void> {
    const assignment = await this.detailsRepo.findOne({
      where: { subject_detail_id: id },
      relations: ['advisories'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    // Verificar que no tenga asesorías activas
    if (assignment.advisories && assignment.advisories.length > 0) {
      throw new BadRequestException(
        `Cannot remove assignment because it has ${assignment.advisories.length} active advisories`,
      );
    }

    await this.detailsRepo.delete(id);
  }

  /**
   * Asigna un profesor a una materia
   */
  async assignProfessorToSubject(
    professorId: number,
    subjectId: number,
  ): Promise<SubjectDetails> {
    // Verificar que el profesor existe y es profesor
    const professor = await this.userRepo.findOne({
      where: { user_id: professorId, role: UserRole.PROFESSOR },
    });
    if (!professor) {
      throw new NotFoundException(`Professor with ID ${professorId} not found`);
    }

    // Verificar que la materia existe
    const subject = await this.subjectRepo.findOne({
      where: { subject_id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    // Verificar que no existe ya esta asignación
    const existingAssignment = await this.detailsRepo.findOne({
      where: { professor_id: professorId, subject_id: subjectId },
    });
    if (existingAssignment) {
      throw new BadRequestException(
        `Professor ${professor.name} ${professor.last_name} is already assigned to subject "${subject.subject}"`,
      );
    }

    // Crear la asignación
    const assignment = this.detailsRepo.create({
      professor_id: professorId,
      subject_id: subjectId,
      professor,
      subject,
    });

    return await this.detailsRepo.save(assignment);
  }

  /**
   * Remueve asignación de profesor a materia
   */
  async removeAssignment(assignmentId: number): Promise<void> {
    return this.remove(assignmentId);
  }

  /**
   * Obtiene todas las materias asignadas a un profesor
   */
  async getProfessorSubjects(professorId: number): Promise<SubjectDetails[]> {
    return this.findByProfessor(professorId);
  }

  /**
   * Obtiene todos los profesores asignados a una materia
   */
  async getSubjectProfessors(subjectId: number): Promise<
    Array<{
      assignment_id: number;
      professor: {
        user_id: number;
        name: string;
        last_name: string;
        email: string;
      };
      assignmentDetails: {
        assignment_id: number;
        active_advisories: number;
      };
    }>
  > {
    const assignments = await this.detailsRepo.find({
      where: { subject_id: subjectId },
      relations: ['professor', 'advisories'],
      order: { subject_detail_id: 'DESC' },
    });

    return assignments.map((assignment) => ({
      assignment_id: assignment.subject_detail_id,
      professor: {
        user_id: assignment.professor.user_id,
        name: assignment.professor.name,
        last_name: assignment.professor.last_name,
        email: assignment.professor.email,
      },
      assignmentDetails: {
        assignment_id: assignment.subject_detail_id,
        active_advisories: assignment.advisories?.length || 0,
      },
    }));
  }

  /**
   * Verifica si un profesor está asignado a una materia específica
   */
  async isProfessorAssignedToSubject(
    professorId: number,
    subjectId: number,
  ): Promise<boolean> {
    const assignment = await this.detailsRepo.findOne({
      where: { professor_id: professorId, subject_id: subjectId },
    });

    return !!assignment;
  }

  /**
   * Obtiene estadísticas de asignaciones por materia
   */
  async getAssignmentStatsBySubject(): Promise<
    Array<{
      subject: {
        subject_id: number;
        subject: string;
      };
      professors_count: number;
      active_advisories_count: number;
      total_students_served: number;
    }>
  > {
    const stats = await this.detailsRepo
      .createQueryBuilder('sd')
      .leftJoin('sd.subject', 'subject')
      .leftJoin('sd.advisories', 'advisory')
      .leftJoin('advisory.advisory_dates', 'dates')
      .leftJoin('dates.attendances', 'attendance')
      .select([
        'subject.subject_id',
        'subject.subject',
        'COUNT(DISTINCT sd.professor_id) as professors_count',
        'COUNT(DISTINCT advisory.advisory_id) as active_advisories_count',
        'COUNT(DISTINCT attendance.student_id) as total_students_served',
      ])
      .groupBy('subject.subject_id')
      .orderBy('subject.subject', 'ASC')
      .getRawMany();

    return stats.map((stat) => ({
      subject: {
        subject_id: parseInt(stat.subject_id),
        subject: stat.subject_subject,
      },
      professors_count: parseInt(stat.professors_count) || 0,
      active_advisories_count: parseInt(stat.active_advisories_count) || 0,
      total_students_served: parseInt(stat.total_students_served) || 0,
    }));
  }
}
