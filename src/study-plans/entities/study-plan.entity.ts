import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Career } from '../../careers/entities/career.entity';
import { PlanSubject } from '../../plan-subjects/entities/plan-subject.entity';

@Entity('study_plans')
export class StudyPlan {
  @PrimaryGeneratedColumn()
  study_plan_id: number;

  @Column()
  career_id: number;

  @Column()
  year: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Career, (career) => career.study_plans)
  @JoinColumn({ name: 'career_id' })
  career: Career;

  @OneToMany(() => PlanSubject, (planSubject) => planSubject.study_plan)
  plan_subjects: PlanSubject[];
}
