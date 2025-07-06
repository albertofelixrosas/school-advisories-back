import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { SubjectSchedule } from '../../subject-schedules/entities/subject-schedule.entity';
import { User } from '../../users/entities/user.entity';

@Entity('subject_details')
export class SubjectDetails {
  @PrimaryGeneratedColumn()
  subject_detail_id: number;

  @Column()
  subject_id: number;

  @Column()
  professor_id: number;

  @ManyToOne(() => Subject, (subject) => subject.details)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => User, (user) => user.subject_details)
  @JoinColumn({ name: 'professor_id' })
  professor: User;

  @OneToMany(() => SubjectSchedule, (schedule) => schedule.subject_details, {
    cascade: true,
  })
  schedules: SubjectSchedule[];
}
