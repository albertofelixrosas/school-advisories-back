import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Advisory } from '../../advisories/entities/advisory.entity';
import { WeekDay } from 'src/common/week-day.enum';

@Entity('advisories_schedules')
export class AdvisorySchedule {
  @PrimaryGeneratedColumn()
  advisory_schedule_id: number;

  @Column({
    type: 'enum',
    enum: WeekDay,
  })
  day: WeekDay;

  @Column({ type: 'time' })
  begin_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column()
  advisory_id: number;

  @Column({ default: 5 })
  max_students_per_slot: number;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => Advisory, (advisory) => advisory.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'advisory_id' })
  advisory: Advisory;
}
