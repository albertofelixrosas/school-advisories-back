import { Injectable } from '@nestjs/common';
import { StudyPlansService } from '../study-plans/study-plans.service';
import { PlanSubjectsService } from '../plan-subjects/plan-subjects.service';
import { StudyPlan } from '../study-plans/entities/study-plan.entity';

export interface StudentAcademicInfo {
  career_id: number;
  enrollment_year: number;
  inferredPlan: StudyPlan | null;
  isSubjectInPlan?: boolean;
}

@Injectable()
export class AcademicService {
  constructor(
    private readonly studyPlansService: StudyPlansService,
    private readonly planSubjectsService: PlanSubjectsService,
  ) {}

  /**
   * Obtiene la información académica completa de un estudiante
   * incluye su plan de estudios inferido
   */
  async getStudentAcademicInfo(
    careerId: number,
    enrollmentYear: number,
  ): Promise<StudentAcademicInfo> {
    const inferredPlan = await this.studyPlansService.inferStudyPlan(
      careerId,
      enrollmentYear,
    );

    return {
      career_id: careerId,
      enrollment_year: enrollmentYear,
      inferredPlan,
    };
  }

  /**
   * Verifica si una materia pertenece al plan de estudios de un estudiante
   */
  async isSubjectInStudentPlan(
    careerId: number,
    enrollmentYear: number,
    subjectId: number,
  ): Promise<boolean> {
    const inferredPlan = await this.studyPlansService.inferStudyPlan(
      careerId,
      enrollmentYear,
    );

    if (!inferredPlan) {
      return false;
    }

    return await this.planSubjectsService.isSubjectInPlan(
      inferredPlan.study_plan_id,
      subjectId,
    );
  }

  /**
   * Obtiene todas las materias del plan de estudios de un estudiante
   */
  async getStudentSubjects(careerId: number, enrollmentYear: number) {
    const inferredPlan = await this.studyPlansService.inferStudyPlan(
      careerId,
      enrollmentYear,
    );

    if (!inferredPlan) {
      return [];
    }

    return await this.planSubjectsService.findByPlan(
      inferredPlan.study_plan_id,
    );
  }
}
