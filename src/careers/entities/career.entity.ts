import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudyPlan } from '../../study-plans/entities/study-plan.entity';
import { User } from '../../users/entities/user.entity';

@Entity('careers')
export class Career {
  @PrimaryGeneratedColumn()
  career_id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, unique: true })
  code: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => StudyPlan, (studyPlan) => studyPlan.career)
  study_plans: StudyPlan[];

  @OneToMany(() => User, (user) => user.career)
  users: User[];
}
