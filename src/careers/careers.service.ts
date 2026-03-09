import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { User } from '../users/entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { PlanSubject } from '../plan-subjects/entities/plan-subject.entity';
import { StudyPlan } from '../study-plans/entities/study-plan.entity';
import { UserRole } from '../users/user-role.enum';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(Career)
    private careersRepo: Repository<Career>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Subject)
    private subjectsRepo: Repository<Subject>,
    @InjectRepository(PlanSubject)
    private planSubjectsRepo: Repository<PlanSubject>,
    @InjectRepository(StudyPlan)
    private studyPlansRepo: Repository<StudyPlan>,
  ) {}

  async create(createCareerDto: CreateCareerDto): Promise<Career> {
    const career = this.careersRepo.create(createCareerDto);
    return await this.careersRepo.save(career);
  }

  async findAll(): Promise<Career[]> {
    return await this.careersRepo.find({
      relations: ['study_plans'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Career> {
    const career = await this.careersRepo.findOne({
      where: { career_id: id },
      relations: ['study_plans'],
    });

    if (!career) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    return career;
  }

  async update(id: number, updateCareerDto: UpdateCareerDto): Promise<Career> {
    const career = await this.findOne(id);
    Object.assign(career, updateCareerDto);
    return await this.careersRepo.save(career);
  }

  async remove(id: number): Promise<void> {
    const career = await this.findOne(id);
    await this.careersRepo.remove(career);
  }

  async findActive(): Promise<Career[]> {
    return await this.careersRepo.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  // Estadísticas por carrera
  async getCareerStats(careerId: number) {
    const career = await this.findOne(careerId);

    // Contar estudiantes en esta carrera
    const studentsCount = await this.usersRepo.count({
      where: { career_id: careerId, role: UserRole.STUDENT },
    });

    // Obtener planes de estudio de esta carrera
    const studyPlans = await this.studyPlansRepo.find({
      where: { career_id: careerId },
      order: { year: 'DESC' },
    });

    // Contar materias únicas en todos los planes de esta carrera
    const planIds = studyPlans.map((plan) => plan.study_plan_id);
    let totalSubjects = 0;
    let totalCredits = 0;

    if (planIds.length > 0) {
      const subjectsInPlans = await this.planSubjectsRepo
        .createQueryBuilder('ps')
        .select('DISTINCT ps.subject_id', 'subject_id')
        .addSelect('SUM(ps.credits)', 'credits')
        .where('ps.study_plan_id IN (:...planIds)', { planIds })
        .groupBy('ps.subject_id')
        .getRawMany();

      totalSubjects = subjectsInPlans.length;
      totalCredits = subjectsInPlans.reduce(
        (sum, item) => sum + (parseInt(item.credits) || 0),
        0,
      );
    }

    // Distribución de estudiantes por año de ingreso
    const studentsByYear = await this.usersRepo
      .createQueryBuilder('user')
      .select('user.enrollment_year', 'year')
      .addSelect('COUNT(user.user_id)', 'count')
      .where('user.career_id = :careerId', { careerId })
      .andWhere('user.role = :role', { role: UserRole.STUDENT })
      .andWhere('user.enrollment_year IS NOT NULL')
      .groupBy('user.enrollment_year')
      .orderBy('user.enrollment_year', 'DESC')
      .getRawMany();

    return {
      career: {
        career_id: career.career_id,
        name: career.name,
        code: career.code,
        is_active: career.is_active,
      },
      statistics: {
        total_students: studentsCount,
        total_study_plans: studyPlans.length,
        total_subjects: totalSubjects,
        total_credits: totalCredits,
        students_by_enrollment_year: studentsByYear.map((row) => ({
          year: parseInt(row.year),
          count: parseInt(row.count),
        })),
        study_plans: studyPlans.map((plan) => ({
          study_plan_id: plan.study_plan_id,
          year: plan.year,
          is_active: plan.is_active,
        })),
      },
    };
  }

  // Estadísticas de todas las carreras
  async getAllCareersStats() {
    const careers = await this.careersRepo.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });

    const stats = await Promise.all(
      careers.map(async (career) => {
        const studentsCount = await this.usersRepo.count({
          where: { career_id: career.career_id, role: UserRole.STUDENT },
        });

        const studyPlansCount = await this.studyPlansRepo.count({
          where: { career_id: career.career_id },
        });

        return {
          career_id: career.career_id,
          name: career.name,
          code: career.code,
          students_count: studentsCount,
          study_plans_count: studyPlansCount,
        };
      }),
    );

    const totalStudents = stats.reduce(
      (sum, stat) => sum + stat.students_count,
      0,
    );
    const totalCareers = stats.length;

    return {
      summary: {
        total_careers: totalCareers,
        total_students: totalStudents,
        average_students_per_career:
          totalCareers > 0 ? Math.round(totalStudents / totalCareers) : 0,
      },
      careers: stats,
    };
  }

  // Dashboard académico general
  async getAcademicDashboard() {
    // Obtener todas las carreras activas con sus estadísticas
    const careers = await this.careersRepo.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });

    const careerStats = await Promise.all(
      careers.map(async (career) => {
        const studentsCount = await this.usersRepo.count({
          where: { career_id: career.career_id, role: UserRole.STUDENT },
        });

        const studyPlansCount = await this.studyPlansRepo.count({
          where: { career_id: career.career_id },
        });

        // Contar materias únicas en los planes de esta carrera
        const plans = await this.studyPlansRepo.find({
          where: { career_id: career.career_id },
        });

        const planIds = plans.map((p) => p.study_plan_id);
        let subjectsCount = 0;

        if (planIds.length > 0) {
          const subjects = await this.planSubjectsRepo
            .createQueryBuilder('ps')
            .select('DISTINCT ps.subject_id')
            .where('ps.study_plan_id IN (:...planIds)', { planIds })
            .getRawMany();

          subjectsCount = subjects.length;
        }

        return {
          career_id: career.career_id,
          name: career.name,
          code: career.code,
          students_count: studentsCount,
          study_plans_count: studyPlansCount,
          subjects_count: subjectsCount,
          average_attendance_rate: 0, // Placeholder - calcular más adelante
        };
      }),
    );

    // Distribución de estudiantes por plan de estudios
    const studyPlansDistribution = await this.usersRepo
      .createQueryBuilder('user')
      .innerJoin('user.career', 'career')
      .innerJoin(
        'study_plans',
        'plan',
        'plan.career_id = user.career_id AND plan.year <= user.enrollment_year',
      )
      .select([
        'plan.study_plan_id as study_plan_id',
        'plan.year as year',
        'career.name as career_name',
        'COUNT(DISTINCT user.user_id) as students_count',
      ])
      .where('user.role = :role', { role: UserRole.STUDENT })
      .andWhere('user.career_id IS NOT NULL')
      .andWhere('user.enrollment_year IS NOT NULL')
      .groupBy('plan.study_plan_id')
      .addGroupBy('plan.year')
      .addGroupBy('career.name')
      .orderBy('plan.year', 'DESC')
      .getRawMany();

    // Resumen general
    const totalStudents = await this.usersRepo.count({
      where: { role: UserRole.STUDENT },
    });

    const studentsWithCareerAssigned = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.STUDENT })
      .andWhere('user.career_id IS NOT NULL')
      .getCount();

    const totalStudyPlans = await this.studyPlansRepo.count();
    const totalSubjects = await this.subjectsRepo.count();

    return {
      careers: careerStats,
      study_plans_distribution: studyPlansDistribution.map((sp) => ({
        year: parseInt(sp.year),
        plan_name: `Plan ${sp.year} - ${sp.career_name}`,
        students_count: parseInt(sp.students_count),
      })),
      summary: {
        total_careers: careers.length,
        total_students: totalStudents,
        total_study_plans: totalStudyPlans,
        total_subjects: totalSubjects,
        students_with_career_assigned: studentsWithCareerAssigned,
        students_without_career: totalStudents - studentsWithCareerAssigned,
      },
    };
  }
}
