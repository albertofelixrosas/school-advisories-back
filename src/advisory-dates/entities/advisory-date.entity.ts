import { Advisory } from '../../advisories/entities/advisory.entity';
import { AdvisoryAttendance } from '../../advisory-attendance/entities/advisory-attendance.entity';
import { Venue } from '../../venues/entities/venue.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('advisory_dates')
export class AdvisoryDate {
  @PrimaryGeneratedColumn()
  advisory_date_id: number;

  @Column()
  advisory_id: number;

  @Column()
  venue_id: number;

  @Column()
  topic: string;

  @Column()
  date: string; // ISO 8601 date string, e.g., "2023-10-01T10:00:00Z"

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  session_link: string;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // One advisory date have only one advisory but an advisory can have many dates
  @ManyToOne(() => Advisory, (advisory) => advisory.advisory_dates)
  @JoinColumn({ name: 'advisory_id' })
  advisory: Advisory;

  // One advisory date have only one venue but an venue can have many advisory dates
  @ManyToOne(() => Venue, (venue) => venue.advisory_dates)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @OneToMany(() => AdvisoryAttendance, (attendance) => attendance.advisory_date)
  attendances: AdvisoryAttendance[];
}
