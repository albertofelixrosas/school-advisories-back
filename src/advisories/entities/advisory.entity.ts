import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AdvisorySchedule } from 'src/advisory-schedules/entities/advisory-schedule.entity';
import { SubjectDetails } from 'src/subject-details/entities/subject-detail.entity';
import { AdvisoryDate } from 'src/advisory-dates/entities/advisory-date.entity';

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

  @ManyToOne(() => User, (user) => user.advisory_dates, {
    cascade: true,
  })
  @JoinColumn({ name: 'professor_id' })
  professor: User;

  @ManyToOne(
    () => SubjectDetails,
    (subjectDetails) => subjectDetails.advisories,
    {
      cascade: true,
    },
  )
  @JoinColumn({ name: 'subject_detail_id' })
  subject_detail: SubjectDetails;

  @OneToMany(() => AdvisorySchedule, (schedule) => schedule.advisory, {
    cascade: true,
  })
  schedules: AdvisorySchedule[];

  @OneToMany(() => AdvisoryDate, (advisoryDate) => advisoryDate.advisory, {
    cascade: true,
  })
  advisory_dates: AdvisoryDate[];
}
