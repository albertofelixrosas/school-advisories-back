import { AdvisoryDate } from '../../advisory-dates/entities/advisory-date.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AdvisoryAttendance {
  @PrimaryGeneratedColumn()
  advisory_attendance_id: number;

  @Column()
  student_id: number;

  @Column()
  advisory_date_id: number;

  @ManyToOne(() => User, (user) => user.attendances)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => AdvisoryDate, (advisoryDate) => advisoryDate.attendances)
  @JoinColumn({ name: 'advisory_date_id' })
  advisory_date: AdvisoryDate;

  @Column({ default: false })
  attended: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
