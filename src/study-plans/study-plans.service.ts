import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { StudyPlan } from './entities/study-plan.entity';
import { CreateStudyPlanDto } from './dto/create-study-plan.dto';
import { UpdateStudyPlanDto } from './dto/update-study-plan.dto';

@Injectable()
export class StudyPlansService {
  constructor(
    @InjectRepository(StudyPlan)
    private studyPlansRepo: Repository<StudyPlan>,
  ) {}

  async create(createStudyPlanDto: CreateStudyPlanDto): Promise<StudyPlan> {
    const studyPlan = this.studyPlansRepo.create(createStudyPlanDto);
    return await this.studyPlansRepo.save(studyPlan);
  }

  async findAll(): Promise<StudyPlan[]> {
    return await this.studyPlansRepo.find({
      relations: ['career', 'plan_subjects'],
      order: { year: 'DESC' },
    });
  }

  async findOne(id: number): Promise<StudyPlan> {
    const studyPlan = await this.studyPlansRepo.findOne({
      where: { study_plan_id: id },
      relations: ['career', 'plan_subjects', 'plan_subjects.subject'],
    });

    if (!studyPlan) {
      throw new NotFoundException(
        `Plan de estudios con ID ${id} no encontrado`,
      );
    }

    return studyPlan;
  }

  async findByCareer(careerId: number): Promise<StudyPlan[]> {
    return await this.studyPlansRepo.find({
      where: { career_id: careerId, is_active: true },
      relations: ['career'],
      order: { year: 'DESC' },
    });
  }

  async update(
    id: number,
    updateStudyPlanDto: UpdateStudyPlanDto,
  ): Promise<StudyPlan> {
    const studyPlan = await this.findOne(id);
    Object.assign(studyPlan, updateStudyPlanDto);
    return await this.studyPlansRepo.save(studyPlan);
  }

  async remove(id: number): Promise<void> {
    const studyPlan = await this.findOne(id);
    await this.studyPlansRepo.remove(studyPlan);
  }

  /**
   * Infiere el plan de estudios de un estudiante basado en su carrera y año de ingreso
   * Retorna el plan más reciente que sea <= al año de ingreso del estudiante
   */
  async inferStudyPlan(
    careerId: number,
    enrollmentYear: number,
  ): Promise<StudyPlan | null> {
    const studyPlan = await this.studyPlansRepo.findOne({
      where: {
        career_id: careerId,
        year: LessThanOrEqual(enrollmentYear),
        is_active: true,
      },
      relations: ['career'],
      order: { year: 'DESC' },
    });

    return studyPlan || null;
  }
}
