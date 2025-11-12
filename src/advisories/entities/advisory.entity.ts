import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AdvisorySchedule } from '../../advisory-schedules/entities/advisory-schedule.entity';
import { SubjectDetails } from '../../subject-details/entities/subject-detail.entity';
import { AdvisoryDate } from '../../advisory-dates/entities/advisory-date.entity';
import { AdvisoryStatus } from '../advisory-status.enum';

@Entity('advisories')
export class Advisory {
  @PrimaryGeneratedColumn()
  advisory_id: number;

  @Column()
  professor_id: number;

  @Column()
  subject_detail_id: number;

  @Column()
  max_students: number;

  @Column({
    type: 'enum',
    enum: AdvisoryStatus,
    default: AdvisoryStatus.PENDING,
  })
  status: AdvisoryStatus;

  @Column({ nullable: true })
  created_by_id: number;

  @Column({ nullable: true })
  cancelled_by_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.advisories)
  @JoinColumn({ name: 'professor_id' })
  professor: User;

  @ManyToOne(
    () => SubjectDetails,
    (subjectDetails) => subjectDetails.advisories,
  )
  @JoinColumn({ name: 'subject_detail_id' })
  subject_detail: SubjectDetails;

  @OneToMany(() => AdvisorySchedule, (schedule) => schedule.advisory)
  schedules: AdvisorySchedule[];

  @OneToMany(() => AdvisoryDate, (advisoryDate) => advisoryDate.advisory)
  advisory_dates: AdvisoryDate[];
}
