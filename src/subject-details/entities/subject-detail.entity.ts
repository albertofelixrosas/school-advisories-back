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
import { Subject } from '../../subjects/entities/subject.entity';
import { SubjectSchedule } from '../../subject-schedules/entities/subject-schedule.entity';
import { User } from '../../users/entities/user.entity';
import { Advisory } from '../../advisories/entities/advisory.entity';

@Entity('subject_details')
export class SubjectDetails {
  @PrimaryGeneratedColumn()
  subject_detail_id: number;

  @Column()
  subject_id: number;

  @Column()
  professor_id: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Subject, (subject) => subject.details)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => User, (user) => user.subject_details)
  @JoinColumn({ name: 'professor_id' })
  professor: User;

  @OneToMany(() => SubjectSchedule, (schedule) => schedule.subject_details, {
    cascade: true,
    eager: true,
  })
  schedules: SubjectSchedule[];

  @OneToMany(() => Advisory, (advisory) => advisory.subject_detail)
  advisories: Advisory[];
}
