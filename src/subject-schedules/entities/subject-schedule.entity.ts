import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubjectDetails } from '../../subject-details/entities/subject-detail.entity';
import { WeekDay } from '../../common/week-day.enum';

@Entity('subject_schedules')
export class SubjectSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: WeekDay })
  day: WeekDay;

  @Column()
  start_time: string; // Ejemplo: "08:00"

  @Column()
  end_time: string; // Ejemplo: "10:00"

  @Column()
  subject_details_id: number;

  @ManyToOne(() => SubjectDetails, (details) => details.schedules)
  @JoinColumn({ name: 'subject_details_id' })
  subject_details: SubjectDetails;
}
