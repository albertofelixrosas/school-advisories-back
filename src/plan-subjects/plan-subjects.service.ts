import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanSubject } from './entities/plan-subject.entity';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectDto } from './dto/update-plan-subject.dto';

@Injectable()
export class PlanSubjectsService {
  constructor(
    @InjectRepository(PlanSubject)
    private planSubjectsRepo: Repository<PlanSubject>,
  ) {}

  async create(
    createPlanSubjectDto: CreatePlanSubjectDto,
  ): Promise<PlanSubject> {
    const planSubject = this.planSubjectsRepo.create(createPlanSubjectDto);
    return await this.planSubjectsRepo.save(planSubject);
  }

  async findAll(): Promise<PlanSubject[]> {
    return await this.planSubjectsRepo.find({
      relations: ['study_plan', 'subject'],
      order: { semester: 'ASC' },
    });
  }

  async findOne(id: number): Promise<PlanSubject> {
    const planSubject = await this.planSubjectsRepo.findOne({
      where: { plan_subject_id: id },
      relations: ['study_plan', 'subject'],
    });

    if (!planSubject) {
      throw new NotFoundException(`Plan-Subject con ID ${id} no encontrado`);
    }

    return planSubject;
  }

  async findByPlan(studyPlanId: number): Promise<PlanSubject[]> {
    return await this.planSubjectsRepo.find({
      where: { study_plan_id: studyPlanId },
      relations: ['subject', 'study_plan'],
      order: { semester: 'ASC' },
    });
  }

  async findBySemester(
    studyPlanId: number,
    semester: number,
  ): Promise<PlanSubject[]> {
    return await this.planSubjectsRepo.find({
      where: { study_plan_id: studyPlanId, semester },
      relations: ['subject'],
      order: { subject: { subject: 'ASC' } },
    });
  }

  async update(
    id: number,
    updatePlanSubjectDto: UpdatePlanSubjectDto,
  ): Promise<PlanSubject> {
    const planSubject = await this.findOne(id);
    Object.assign(planSubject, updatePlanSubjectDto);
    return await this.planSubjectsRepo.save(planSubject);
  }

  async remove(id: number): Promise<void> {
    const planSubject = await this.findOne(id);
    await this.planSubjectsRepo.remove(planSubject);
  }

  /**
   * Verifica si una materia pertenece al plan de estudios de un estudiante
   */
  async isSubjectInPlan(
    studyPlanId: number,
    subjectId: number,
  ): Promise<boolean> {
    const planSubject = await this.planSubjectsRepo.findOne({
      where: { study_plan_id: studyPlanId, subject_id: subjectId },
    });

    return !!planSubject;
  }
}
