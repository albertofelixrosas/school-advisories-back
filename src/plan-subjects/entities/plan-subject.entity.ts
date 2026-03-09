import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudyPlan } from '../../study-plans/entities/study-plan.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('plan_subjects')
export class PlanSubject {
  @PrimaryGeneratedColumn()
  plan_subject_id: number;

  @Column()
  study_plan_id: number;

  @Column()
  subject_id: number;

  @Column()
  semester: number;

  @Column({ default: true })
  is_required: boolean;

  @Column({ nullable: true })
  credits: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => StudyPlan, (studyPlan) => studyPlan.plan_subjects)
  @JoinColumn({ name: 'study_plan_id' })
  study_plan: StudyPlan;

  @ManyToOne(() => Subject, (subject) => subject.details)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;
}
